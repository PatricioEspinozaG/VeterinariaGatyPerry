package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.model.SesionRefresh;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.SesionRefreshRepository;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SesionRefreshService {

    private static final Duration DURACION_SESION = Duration.ofDays(7);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final SesionRefreshRepository sesiones;
    private final UsuarioRepository usuarios;

    public SesionRefreshService(
        SesionRefreshRepository sesiones,
        UsuarioRepository usuarios
    ) {
        this.sesiones = sesiones;
        this.usuarios = usuarios;
    }

    @Transactional
    public ResultadoSesion crearSesion(UsuarioResponse usuarioAutenticado) {
        Usuario usuario = usuarios.findById(usuarioAutenticado.id())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Cuenta no disponible"
            ));

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Cuenta no disponible"
            );
        }

        Instant ahora = Instant.now();
        Instant expiraEn = ahora.plus(DURACION_SESION);

        return guardarSesion(
            usuario,
            UUID.randomUUID(),
            ahora,
            expiraEn
        );
    }

    @Transactional
    public Optional<ResultadoSesion> renovar(String token) {
        if (!tieneFormatoValido(token)) {
            return Optional.empty();
        }

        Instant ahora = Instant.now();

        Optional<SesionRefresh> encontrada =
            sesiones.buscarPorHashParaActualizar(calcularHash(token));

        if (encontrada.isEmpty()) {
            return Optional.empty();
        }

        SesionRefresh anterior = encontrada.get();

        if (anterior.getUsadoEn() != null
            || anterior.getRevocadoEn() != null) {
            sesiones.revocarFamilia(anterior.getFamiliaId(), ahora);
            return Optional.empty();
        }

        if (!anterior.getExpiraEn().isAfter(ahora)
            || !anterior.getUsuario().isActivo()) {
            sesiones.revocarFamilia(anterior.getFamiliaId(), ahora);
            return Optional.empty();
        }

        anterior.marcarUsado(ahora);

        ResultadoSesion nueva = guardarSesion(
            anterior.getUsuario(),
            anterior.getFamiliaId(),
            ahora,
            anterior.getExpiraEn()
        );

        return Optional.of(nueva);
    }

    @Transactional
    public void cerrarSesion(String token) {
        if (!tieneFormatoValido(token)) {
            return;
        }

        sesiones.buscarPorHashParaActualizar(calcularHash(token))
            .ifPresent(sesion -> sesiones.revocarFamilia(
                sesion.getFamiliaId(),
                Instant.now()
            ));
    }

    private ResultadoSesion guardarSesion(
        Usuario usuario,
        UUID familiaId,
        Instant ahora,
        Instant expiraEn
    ) {
        String token = generarToken();

        sesiones.save(new SesionRefresh(
            usuario,
            familiaId,
            calcularHash(token),
            ahora,
            expiraEn
        ));

        return new ResultadoSesion(
            token,
            expiraEn,
            UsuarioResponse.from(usuario)
        );
    }

    private static String generarToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(bytes);
    }

    private static boolean tieneFormatoValido(String token) {
        return token != null
            && token.matches("[A-Za-z0-9_-]{43}");
    }

    private static String calcularHash(String token) {
        try {
            byte[] bytes = MessageDigest
                .getInstance("SHA-256")
                .digest(token.getBytes(java.nio.charset.StandardCharsets.US_ASCII));

            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                "SHA-256 no está disponible",
                exception
            );
        }
    }

    public record ResultadoSesion(
        String refreshToken,
        Instant expiraEn,
        UsuarioResponse usuario
    ) {
    }
}