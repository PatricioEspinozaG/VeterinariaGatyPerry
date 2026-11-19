package cl.gatyperry.pacientes.mascotas.controller;

import cl.gatyperry.pacientes.mascotas.dto.MascotaParaCitaResponse;
import cl.gatyperry.pacientes.mascotas.service.MascotaGestionService;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/mascotas/gestion")
public class MascotaGestionController {

    private final MascotaGestionService service;

    public MascotaGestionController(MascotaGestionService service) {
        this.service = service;
    }

    @GetMapping
    public List<MascotaParaCitaResponse> listar(
        @RequestParam @Positive Long clienteId
    ) {
        return service.listarPorCliente(clienteId);
    }

    @GetMapping("/{id}")
    public MascotaParaCitaResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }
}