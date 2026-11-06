package cl.gatyperry.pacientes.mascotas.controller;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.gatyperry.pacientes.mascotas.dto.MascotaRequest;
import cl.gatyperry.pacientes.mascotas.dto.MascotaResponse;
import cl.gatyperry.pacientes.mascotas.service.MascotaService;

@RestController
@RequestMapping("/api/v1/mascotas")
public class MascotaController {

    private final MascotaService service;

    public MascotaController(MascotaService service) {
        this.service = service;
    }

    @GetMapping
    public List<MascotaResponse> listar(@RequestParam String userId) {
        return service.listar(userId);
    }

    @GetMapping("/{id}")
    public MascotaResponse obtener(
        @PathVariable Long id,
        @RequestParam String userId
    ) {
        return service.obtener(id, userId);
    }

    @PostMapping
    public ResponseEntity<MascotaResponse> crear(
        @RequestParam String userId,
        @Valid @RequestBody MascotaRequest request
    ) {
        MascotaResponse creada = service.crear(userId, request);

        return ResponseEntity
            .created(URI.create("/api/v1/mascotas/" + creada.id()))
            .body(creada);
    }

    @PutMapping("/{id}")
    public MascotaResponse actualizar(
        @PathVariable Long id,
        @RequestParam String userId,
        @Valid @RequestBody MascotaRequest request
    ) {
        return service.actualizar(id, userId, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
        @PathVariable Long id,
        @RequestParam String userId
    ) {
        service.eliminar(id, userId);
        return ResponseEntity.noContent().build();
    }
}