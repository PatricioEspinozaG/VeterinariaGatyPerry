package cl.gatyperry.productos.productos.service;

import cl.gatyperry.productos.productos.dto.ProductoRequest;
import cl.gatyperry.productos.productos.dto.ProductoResponse;
import cl.gatyperry.productos.productos.model.Producto;
import cl.gatyperry.productos.productos.repository.ProductoRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductosService {

    private final ProductoRepository repository;

    public ProductosService(ProductoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarCatalogo() {
        return repository.findAllByActivoTrueOrderByCodigoAsc()
            .stream()
            .map(ProductoResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(String codigo) {
        return repository.findByCodigoAndActivoTrue(normalizarCodigo(codigo))
            .map(ProductoResponse::from)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado"
            ));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarGestion() {
        return repository.findAllByOrderByCodigoAsc()
            .stream()
            .map(ProductoResponse::from)
            .toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        String codigo = normalizarCodigo(request.code());
        if (repository.existsById(codigo)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El código del producto ya existe"
            );
        }

        Producto producto = new Producto();
        producto.setCodigo(codigo);
        aplicarDatos(producto, request, true);
        return ProductoResponse.from(repository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(String codigo, ProductoRequest request) {
        Producto producto = repository.findById(normalizarCodigo(codigo))
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado"
            ));

        String codigoRequest = normalizarCodigo(request.code());
        if (!producto.getCodigo().equals(codigoRequest)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El código del producto no se puede cambiar"
            );
        }

        aplicarDatos(producto, request, false);
        return ProductoResponse.from(repository.save(producto));
    }

    @Transactional
    public void descontinuar(String codigo) {
        Producto producto = repository.findById(normalizarCodigo(codigo))
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Producto no encontrado"
            ));
        producto.setActivo(false);
        repository.save(producto);
    }

    private void aplicarDatos(
        Producto producto,
        ProductoRequest request,
        boolean esNuevo
    ) {
        producto.setNombre(request.name().trim());
        producto.setCategoria(
            request.category() == null || request.category().isBlank()
                ? "General" : request.category().trim()
        );
        producto.setPrincipioActivo(
            valor(request.activeIngredient(), producto.getPrincipioActivo())
        );
        producto.setPresentacion(
            valor(request.presentation(), producto.getPresentacion())
        );
        producto.setEspecies(
            valor(request.species(), producto.getEspecies())
        );
        producto.setStock(request.stock());
        producto.setPrecio(request.price());
        producto.setStockCritico(
            request.criticalStock() == null
                ? esNuevo ? 5 : producto.getStockCritico()
                : request.criticalStock()
        );
        aplicarEstado(producto, request.status());
    }

    private void aplicarEstado(Producto producto, String estado) {
        if (estado == null || estado.isBlank()) {
            return;
        }

        switch (estado.trim().toLowerCase(Locale.ROOT)) {
            case "disponible" -> producto.setActivo(true);
            case "agotado" -> {
                producto.setActivo(true);
                producto.setStock(0);
            }
            case "descontinuado" -> producto.setActivo(false);
            default -> throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Estado de producto no válido"
            );
        }
    }

    private String valor(String nuevo, String actual) {
        if (nuevo == null) {
            return actual;
        }
        return nuevo.trim();
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El código del producto es obligatorio"
            );
        }
        return codigo.trim().toUpperCase(Locale.ROOT);
    }
}
