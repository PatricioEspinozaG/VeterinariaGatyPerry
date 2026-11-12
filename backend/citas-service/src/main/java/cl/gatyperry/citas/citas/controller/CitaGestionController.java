package cl.gatyperry.citas.citas.controller;

import cl.gatyperry.citas.citas.dto.CitaResponse;
import cl.gatyperry.citas.citas.service.CitaGestionService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}