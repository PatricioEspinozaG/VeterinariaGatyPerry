package cl.gatyperry.pacientes.mascotas.controller;

import cl.gatyperry.pacientes.mascotas.dto.MascotaRequest;
import cl.gatyperry.pacientes.mascotas.dto.MascotaResponse;
import cl.gatyperry.pacientes.mascotas.service.MascotaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mascotas")
public class MascotaController {

    private final MascotaService service;

    public MascotaController(MascotaService service) {
        this.service = service;
    }

    @GetMapping
    public List<MascotaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(jwt.getSubject());
    }

    @GetMapping("/{id}")
    public MascotaResponse obtener(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.obtener(id, jwt.getSubject());
    }

    @PostMapping
    public ResponseEntity<MascotaResponse> crear(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody MascotaRequest request
    ) {
        MascotaResponse creada = service.crear(jwt.getSubject(), request);
        return ResponseEntity
            .created(URI.create("/api/v1/mascotas/" + creada.id()))
            .body(creada);
    }

    @PutMapping("/{id}")
    public MascotaResponse actualizar(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody MascotaRequest request
    ) {
        return service.actualizar(id, jwt.getSubject(), request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        service.eliminar(id, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }
}