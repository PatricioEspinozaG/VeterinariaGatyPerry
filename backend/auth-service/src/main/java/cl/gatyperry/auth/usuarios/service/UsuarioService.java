package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.RegistroRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import cl.gatyperry.auth.usuarios.dto.LoginRequest;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse registrar(RegistroRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Las contraseñas no coinciden"
            );
        }

        String run = normalizarRun(request.run());
        if (!esRunValido(run)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "El RUN no es válido"
            );
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (repository.existsByRun(run)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "El RUN ya está registrado"
            );
        }

        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "El correo ya está registrado"
            );
        }

        Usuario usuario = new Usuario();
        usuario.setRun(run);
        usuario.setNombre(request.nombre().trim());
        usuario.setApellidos(request.apellidos().trim());
        usuario.setEmail(email);
        usuario.setTelefono(request.telefono().trim());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setRegion(request.region().trim());
        usuario.setComuna(request.comuna().trim());
        usuario.setDireccion(
            request.direccion() == null ? null : request.direccion().trim()
        );
        usuario.setRol(Rol.CLIENTE);
        usuario.setActivo(true);

        return UsuarioResponse.from(repository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse autenticar(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        Usuario usuario = repository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"
            ));

        if (!passwordEncoder.matches(request.password(), usuario.getPasswordHash())
            || !usuario.isActivo()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"
            );
        }

    return UsuarioResponse.from(usuario);
}
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuarioActivo(Long id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Cuenta no disponible"
            ));

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Cuenta no disponible"
            );
        }

        return UsuarioResponse.from(usuario);
    }

    private String normalizarRun(String run) {
        return run.trim()
            .toUpperCase(Locale.ROOT)
            .replaceAll("[.\\s-]", "");
    }

    private boolean esRunValido(String run) {
        if (!run.matches("\\d{7,8}[0-9K]")) {
            return false;
        }

        int suma = 0;
        int factor = 2;

        for (int i = run.length() - 2; i >= 0; i--) {
            suma += Character.digit(run.charAt(i), 10) * factor;
            factor = factor == 7 ? 2 : factor + 1;
        }

        int resultado = 11 - (suma % 11);
        char digitoEsperado = resultado == 11
            ? '0'
            : resultado == 10 ? 'K' : Character.forDigit(resultado, 10);

        return run.charAt(run.length() - 1) == digitoEsperado;
    }
}