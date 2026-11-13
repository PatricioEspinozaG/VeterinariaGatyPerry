package cl.gatyperry.productos.productos.controller;

import cl.gatyperry.productos.productos.dto.ProductoRequest;
import cl.gatyperry.productos.productos.dto.ProductoResponse;
import cl.gatyperry.productos.productos.service.ProductosService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductosController {

    private final ProductosService service;

    public ProductosController(ProductosService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductoResponse> listar() {
        return service.listarCatalogo();
    }

    @GetMapping("/{codigo}")
    public ProductoResponse obtener(@PathVariable String codigo) {
        return service.obtener(codigo);
    }

    @GetMapping("/gestion")
    public List<ProductoResponse> listarGestion() {
        return service.listarGestion();
    }

    @PostMapping("/gestion")
    public ResponseEntity<ProductoResponse> crear(
        @Valid @RequestBody ProductoRequest request
    ) {
        ProductoResponse creado = service.crear(request);
        return ResponseEntity
            .created(URI.create("/api/v1/productos/" + creado.code()))
            .body(creado);
    }

    @PutMapping("/gestion/{codigo}")
    public ProductoResponse actualizar(
        @PathVariable String codigo,
        @Valid @RequestBody ProductoRequest request
    ) {
        return service.actualizar(codigo, request);
    }

    @DeleteMapping("/gestion/{codigo}")
    public ResponseEntity<Void> descontinuar(@PathVariable String codigo) {
        service.descontinuar(codigo);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
