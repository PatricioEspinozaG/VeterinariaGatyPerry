package cl.gatyperry.auth.usuarios.controller;

import cl.gatyperry.auth.usuarios.dto.AdminUsuarioUpdateRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.service.AdminUsuarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
public class AdminUsuarioController {

    private final AdminUsuarioService service;

    public AdminUsuarioController(AdminUsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public Page<UsuarioResponse> listar(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "20") int tamano
    ) {
        return service.listar(
            Long.valueOf(jwt.getSubject()), pagina, tamano
        );
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Long id
    ) {
        return service.obtener(Long.valueOf(jwt.getSubject()), id);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Long id,
        @Valid @RequestBody AdminUsuarioUpdateRequest request
    ) {
        return service.actualizar(
            Long.valueOf(jwt.getSubject()), id, request
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Long id
    ) {
        service.desactivar(Long.valueOf(jwt.getSubject()), id);
        return ResponseEntity.noContent().build();
    }
}