package cl.gatyperry.auth.usuarios.controller;

import cl.gatyperry.auth.usuarios.dto.LoginRequest;
import cl.gatyperry.auth.usuarios.dto.LoginResponse;
import cl.gatyperry.auth.usuarios.dto.RegistroRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.service.SesionRefreshService;
import cl.gatyperry.auth.usuarios.service.TokenService;
import cl.gatyperry.auth.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String COOKIE_NAME = "gp_refresh";
    private static final String COOKIE_PATH = "/api/v1/auth";

    private final UsuarioService usuarioService;
    private final TokenService tokenService;
    private final SesionRefreshService sesiones;
    private final boolean secureCookie;

    public AuthController(
        UsuarioService usuarioService,
        TokenService tokenService,
        SesionRefreshService sesiones,
        @Value("${app.auth.refresh-cookie-secure:true}") boolean secureCookie
    ) {
        this.usuarioService = usuarioService;
        this.tokenService = tokenService;
        this.sesiones = sesiones;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(
        @Valid @RequestBody RegistroRequest request
    ) {
        UsuarioResponse usuario = usuarioService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @Valid @RequestBody LoginRequest request
    ) {
        UsuarioResponse usuario = usuarioService.autenticar(request);
        String accessToken = tokenService.crearToken(usuario);
        var sesion = sesiones.crearSesion(usuario);

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookieDeSesion(
                sesion.refreshToken(),
                sesion.expiraEn()
            ).toString())
            .body(new LoginResponse(
                accessToken,
                "Bearer",
                TokenService.DURACION_SEGUNDOS,
                sesion.usuario()
            ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> renovar(
        @CookieValue(name = COOKIE_NAME, required = false) String refreshToken,
        @RequestHeader(name = "X-Gaty-Client", required = false) String cliente
    ) {
        exigirClienteWeb(cliente);

        var resultado = sesiones.renovar(refreshToken);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header(HttpHeaders.SET_COOKIE, borrarCookie().toString())
                .build();
        }

        var sesion = resultado.get();
        String accessToken = tokenService.crearToken(sesion.usuario());

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookieDeSesion(
                sesion.refreshToken(),
                sesion.expiraEn()
            ).toString())
            .body(new LoginResponse(
                accessToken,
                "Bearer",
                TokenService.DURACION_SEGUNDOS,
                sesion.usuario()
            ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> cerrarSesion(
        @CookieValue(name = COOKIE_NAME, required = false) String refreshToken,
        @RequestHeader(name = "X-Gaty-Client", required = false) String cliente
    ) {
        exigirClienteWeb(cliente);
        sesiones.cerrarSesion(refreshToken);

        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, borrarCookie().toString())
            .build();
    }

    @GetMapping("/me")
    public UsuarioResponse miCuenta(@AuthenticationPrincipal Jwt jwt) {
        Long id = Long.valueOf(jwt.getSubject());
        return usuarioService.obtenerUsuarioActivo(id);
    }

    private void exigirClienteWeb(String cliente) {
        if (!"web".equals(cliente)) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Solicitud no permitida"
            );
        }
    }

    private ResponseCookie cookieDeSesion(String token, Instant expiraEn) {
        Duration restante = Duration.between(Instant.now(), expiraEn);

        return ResponseCookie.from(COOKIE_NAME, token)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path(COOKIE_PATH)
            .maxAge(restante.isNegative() ? Duration.ZERO : restante)
            .build();
    }

    private ResponseCookie borrarCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path(COOKIE_PATH)
            .maxAge(Duration.ZERO)
            .build();
    }
}