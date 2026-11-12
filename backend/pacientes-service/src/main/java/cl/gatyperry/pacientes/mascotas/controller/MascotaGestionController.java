package cl.gatyperry.pacientes.mascotas.controller;

import cl.gatyperry.pacientes.mascotas.dto.MascotaParaCitaResponse;
import cl.gatyperry.pacientes.mascotas.service.MascotaGestionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mascotas/gestion")
public class MascotaGestionController {

    private final MascotaGestionService service;

    public MascotaGestionController(MascotaGestionService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public MascotaParaCitaResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }
}