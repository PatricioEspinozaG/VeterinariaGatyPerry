package cl.gatyperry.productos.productos.controller;

import cl.gatyperry.productos.productos.dto.ProductoReservadoResponse;
import cl.gatyperry.productos.productos.dto.ReservaStockRequest;
import cl.gatyperry.productos.productos.service.ReservaStockService;
import cl.gatyperry.productos.productos.service.TokenInternoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/productos/interno/reservas")
public class ReservaStockInternaController {

    private final ReservaStockService reservaService;
    private final TokenInternoService tokenService;

    public ReservaStockInternaController(
        ReservaStockService reservaService,
        TokenInternoService tokenService
    ) {
        this.reservaService = reservaService;
        this.tokenService = tokenService;
    }

    @PostMapping
    public List<ProductoReservadoResponse> reservar(
        @RequestHeader("X-Internal-Token") String token,
        @Valid @RequestBody ReservaStockRequest request
    ) {
        tokenService.validar(token);
        return reservaService.reservar(request);
    }

    @PostMapping("/{orderId}/confirmar")
    public ResponseEntity<Void> confirmar(
        @RequestHeader("X-Internal-Token") String token,
        @PathVariable String orderId
    ) {
        tokenService.validar(token);
        reservaService.confirmar(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{orderId}/liberar")
    public ResponseEntity<Void> liberar(
        @RequestHeader("X-Internal-Token") String token,
        @PathVariable String orderId
    ) {
        tokenService.validar(token);
        reservaService.liberar(orderId);
        return ResponseEntity.noContent().build();
    }
}
