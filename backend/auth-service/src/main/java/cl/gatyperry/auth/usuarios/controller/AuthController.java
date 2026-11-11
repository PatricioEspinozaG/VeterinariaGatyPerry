package cl.gatyperry.auth.usuarios.controller;

import cl.gatyperry.auth.usuarios.dto.LoginRequest;
import cl.gatyperry.auth.usuarios.dto.LoginResponse;
import cl.gatyperry.auth.usuarios.dto.RegistroRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.service.TokenService;
import cl.gatyperry.auth.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final TokenService tokenService;

    public AuthController(
        UsuarioService usuarioService,
        TokenService tokenService
    ) {
        this.usuarioService = usuarioService;
        this.tokenService = tokenService;
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
        String token = tokenService.crearToken(usuario);

        LoginResponse respuesta = new LoginResponse(
            token,
            "Bearer",
            TokenService.DURACION_SEGUNDOS,
            usuario
        );

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/me")
    public UsuarioResponse miCuenta(@AuthenticationPrincipal Jwt jwt) {
        Long id = Long.valueOf(jwt.getSubject());
        return usuarioService.obtenerUsuarioActivo(id);
    }
}