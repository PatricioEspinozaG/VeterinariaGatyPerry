package cl.gatyperry.auth.usuarios.controller;

import cl.gatyperry.auth.usuarios.dto.ClienteParaCitaResponse;
import cl.gatyperry.auth.usuarios.service.ClienteConsultaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/gestion/clientes")
public class ClienteConsultaController {

    private final ClienteConsultaService service;

    public ClienteConsultaController(ClienteConsultaService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ClienteParaCitaResponse obtener(@PathVariable Long id) {
        return service.obtenerClienteActivo(id);
    }
}