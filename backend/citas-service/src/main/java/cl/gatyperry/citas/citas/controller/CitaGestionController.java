package cl.gatyperry.citas.citas.controller;

import cl.gatyperry.citas.citas.dto.CitaEstadoRequest;
import cl.gatyperry.citas.citas.dto.CitaGestionRequest;
import cl.gatyperry.citas.citas.dto.CitaReprogramacionRequest;
import cl.gatyperry.citas.citas.dto.CitaResponse;
import cl.gatyperry.citas.citas.service.CitaGestionService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/citas/gestion")
public class CitaGestionController {

    private final CitaGestionService service;

    public CitaGestionController(CitaGestionService service) {
        this.service = service;
    }

    @GetMapping
    public List<CitaResponse> listar() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public CitaResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<CitaResponse> crear(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody CitaGestionRequest request
    ) {
        CitaResponse creada = service.crear(
            request.userId(),
            request.cita(),
            jwt.getTokenValue()
        );

        return ResponseEntity
            .created(URI.create("/api/v1/citas/gestion/" + creada.id()))
            .body(creada);
    }

    @PutMapping("/{id}")
    public CitaResponse reprogramar(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody CitaReprogramacionRequest request
    ) {
        return service.reprogramar(
            id,
            request,
            jwt.getTokenValue()
        );
    }

    @PatchMapping("/{id}/estado")
    public CitaResponse cambiarEstado(
        @PathVariable Long id,
        @Valid @RequestBody CitaEstadoRequest request
    ) {
        return service.cambiarEstado(id, request.estado());
    }
}