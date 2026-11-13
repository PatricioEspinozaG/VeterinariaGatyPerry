package cl.gatyperry.clinica.controller;

import cl.gatyperry.clinica.config.IdentidadActual;
import cl.gatyperry.clinica.dto.AtencionActualizarRequest;
import cl.gatyperry.clinica.dto.AtencionAnulacionRequest;
import cl.gatyperry.clinica.dto.AtencionCrearRequest;
import cl.gatyperry.clinica.dto.AtencionResponse;
import cl.gatyperry.clinica.dto.HistorialResponse;
import cl.gatyperry.clinica.dto.VacunaActualizarRequest;
import cl.gatyperry.clinica.dto.VacunaAnulacionRequest;
import cl.gatyperry.clinica.dto.VacunaCrearRequest;
import cl.gatyperry.clinica.dto.VacunaResponse;
import cl.gatyperry.clinica.service.AtencionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.net.URI;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clinica")
@SecurityRequirement(name = "bearer-jwt")
public class AtencionController {

    private final AtencionService service;
    private final IdentidadActual identidad;

    public AtencionController(
        AtencionService service,
        IdentidadActual identidad
    ) {
        this.service = service;
        this.identidad = identidad;
    }

    @GetMapping("/mascotas/{mascotaId}/historial")
    @Operation(summary = "Consultar historial clínico de una mascota")
    public HistorialResponse historial(
        @PathVariable Long mascotaId,
        @RequestParam(defaultValue = "50") int limite,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.historial(
            mascotaId,
            limite,
            identidad.userId(jwt),
            identidad.isCliente(jwt),
            jwt.getTokenValue()
        );
    }

    @GetMapping("/atenciones/{id}")
    @Operation(summary = "Consultar una atención")
    public AtencionResponse obtenerAtencion(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.obtener(
            id,
            identidad.userId(jwt),
            identidad.isCliente(jwt),
            jwt.getTokenValue()
        );
    }

    @PostMapping("/gestion/atenciones")
    @Operation(summary = "Registrar una atención")
    public ResponseEntity<AtencionResponse> crearAtencion(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody AtencionCrearRequest request
    ) {
        AtencionResponse creada = service.crear(
            request,
            identidad.userId(jwt),
            jwt.getTokenValue()
        );
        return ResponseEntity
            .created(URI.create("/api/v1/clinica/atenciones/" + creada.id()))
            .body(creada);
    }

    @PutMapping("/gestion/atenciones/{id}")
    @Operation(summary = "Corregir una atención")
    public AtencionResponse actualizarAtencion(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody AtencionActualizarRequest request
    ) {
        return service.actualizar(id, request, identidad.userId(jwt));
    }

    @PatchMapping("/gestion/atenciones/{id}/anulacion")
    @Operation(summary = "Anular una atención sin eliminarla")
    public AtencionResponse anularAtencion(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody AtencionAnulacionRequest request
    ) {
        return service.anular(id, request, identidad.userId(jwt));
    }

    @GetMapping("/vacunas/{id}")
    @Operation(summary = "Consultar una vacuna")
    public VacunaResponse obtenerVacuna(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.obtenerVacuna(
            id,
            identidad.userId(jwt),
            identidad.isCliente(jwt),
            jwt.getTokenValue()
        );
    }

    @PostMapping("/gestion/vacunas")
    @Operation(summary = "Registrar una vacuna aplicada")
    public ResponseEntity<VacunaResponse> crearVacuna(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody VacunaCrearRequest request
    ) {
        VacunaResponse creada = service.crearVacuna(
            request,
            identidad.userId(jwt),
            jwt.getTokenValue()
        );
        return ResponseEntity
            .created(URI.create("/api/v1/clinica/vacunas/" + creada.id()))
            .body(creada);
    }

    @PutMapping("/gestion/vacunas/{id}")
    @Operation(summary = "Corregir una vacuna")
    public VacunaResponse actualizarVacuna(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody VacunaActualizarRequest request
    ) {
        return service.actualizarVacuna(
            id,
            request,
            identidad.userId(jwt)
        );
    }

    @PatchMapping("/gestion/vacunas/{id}/anulacion")
    @Operation(summary = "Anular una vacuna sin eliminarla")
    public VacunaResponse anularVacuna(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody VacunaAnulacionRequest request
    ) {
        return service.anularVacuna(id, request, identidad.userId(jwt));
    }
}
