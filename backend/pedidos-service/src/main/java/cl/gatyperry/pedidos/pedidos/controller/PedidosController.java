package cl.gatyperry.pedidos.pedidos.controller;

import cl.gatyperry.pedidos.pedidos.dto.PedidoRequest;
import cl.gatyperry.pedidos.pedidos.dto.PedidoResponse;
import cl.gatyperry.pedidos.pedidos.service.PedidosService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidosController {

    private final PedidosService service;

    public PedidosController(PedidosService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> crear(
        @AuthenticationPrincipal Jwt jwt,
        @RequestHeader(value = "Idempotency-Key", required = false)
            String idempotencyKey,
        @Valid @RequestBody PedidoRequest request
    ) {
        Long userId = jwt == null ? null : Long.valueOf(jwt.getSubject());
        PedidoResponse creado = service.crear(
            userId,
            request,
            idempotencyKey
        );
        return ResponseEntity
            .created(URI.create("/api/v1/pedidos/" + creado.id()))
            .body(creado);
    }

    @GetMapping("/mis-pedidos")
    public List<PedidoResponse> listarPropios(
        @AuthenticationPrincipal Jwt jwt
    ) {
        return service.listarPropios(Long.valueOf(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public PedidoResponse obtener(
        @PathVariable String id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = Long.valueOf(jwt.getSubject());
        String role = jwt.getClaimAsString("rol");
        boolean staff = "ADMIN".equals(role) || "RECEPCION".equals(role);
        return service.obtener(id, userId, staff);
    }
}
