package cl.gatyperry.citas.citas.controller;

import cl.gatyperry.citas.citas.dto.CitaRequest;
import cl.gatyperry.citas.citas.dto.CitaResponse;
import cl.gatyperry.citas.citas.service.CitaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/citas")
public class CitaController {

    private final CitaService service;

    public CitaController(CitaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CitaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listarPropias(Long.valueOf(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public CitaResponse obtener(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.obtenerPropia(id, Long.valueOf(jwt.getSubject()));
    }

    @PostMapping
    public ResponseEntity<CitaResponse> crear(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody CitaRequest request
    ) {
        CitaResponse creada = service.crear(
            Long.valueOf(jwt.getSubject()),
            jwt.getTokenValue(),
            request
        );

        return ResponseEntity
            .created(URI.create("/api/v1/citas/" + creada.id()))
            .body(creada);
    }

    @PatchMapping("/{id}/cancelar")
    public CitaResponse cancelar(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.cancelarPropia(
            id,
            Long.valueOf(jwt.getSubject())
        );
    }
}