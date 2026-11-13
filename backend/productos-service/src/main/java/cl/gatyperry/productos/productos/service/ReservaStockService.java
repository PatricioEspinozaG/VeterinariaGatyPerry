package cl.gatyperry.productos.productos.service;

import cl.gatyperry.productos.productos.dto.ProductoReservadoResponse;
import cl.gatyperry.productos.productos.dto.ReservaStockRequest;
import cl.gatyperry.productos.productos.model.EstadoReserva;
import cl.gatyperry.productos.productos.model.Producto;
import cl.gatyperry.productos.productos.model.ReservaStock;
import cl.gatyperry.productos.productos.model.ReservaStockItem;
import cl.gatyperry.productos.productos.repository.ProductoRepository;
import cl.gatyperry.productos.productos.repository.ReservaStockRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservaStockService {

    private final ProductoRepository productoRepository;
    private final ReservaStockRepository reservaRepository;

    public ReservaStockService(
        ProductoRepository productoRepository,
        ReservaStockRepository reservaRepository
    ) {
        this.productoRepository = productoRepository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional
    public List<ProductoReservadoResponse> reservar(ReservaStockRequest request) {
        ReservaStock existente = reservaRepository.findById(request.orderId())
            .orElse(null);
        if (existente != null) {
            if (existente.getEstado() == EstadoReserva.LIBERADA) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La reserva de este pedido ya fue liberada"
                );
            }
            return respuesta(existente);
        }

        Map<String, Integer> cantidades = new TreeMap<>();
        for (var item : request.items()) {
            cantidades.merge(
                item.code().trim().toUpperCase(Locale.ROOT),
                item.quantity(),
                Math::addExact
            );
        }

        ReservaStock reserva = new ReservaStock();
        reserva.setIdPedido(request.orderId());
        reserva.setEstado(EstadoReserva.RESERVADA);
        reserva.setCreadaEn(Instant.now());

        List<Producto> productos = new ArrayList<>();
        for (var entry : cantidades.entrySet()) {
            Producto producto = productoRepository
                .findByCodigoForUpdate(entry.getKey())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Producto no encontrado: " + entry.getKey()
                ));

            if (!producto.isActivo()) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El producto " + producto.getCodigo()
                        + " está descontinuado"
                );
            }
            if (producto.getStock() < entry.getValue()) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Stock insuficiente para " + producto.getNombre()
                );
            }

            producto.setStock(producto.getStock() - entry.getValue());
            productos.add(producto);

            ReservaStockItem linea = new ReservaStockItem();
            linea.setCodigoProducto(producto.getCodigo());
            linea.setNombreProducto(producto.getNombre());
            linea.setCantidad(entry.getValue());
            linea.setPrecioUnitario(producto.getPrecio());
            reserva.addItem(linea);
        }

        productoRepository.saveAll(productos);
        return respuesta(reservaRepository.save(reserva));
    }

    @Transactional
    public void confirmar(String orderId) {
        ReservaStock reserva = buscar(orderId);
        if (reserva.getEstado() == EstadoReserva.LIBERADA) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se puede confirmar una reserva liberada"
            );
        }
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reservaRepository.save(reserva);
    }

    @Transactional
    public void liberar(String orderId) {
        ReservaStock reserva = buscar(orderId);
        if (reserva.getEstado() == EstadoReserva.CONFIRMADA) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se puede liberar una reserva confirmada"
            );
        }
        if (reserva.getEstado() == EstadoReserva.LIBERADA) {
            return;
        }

        List<Producto> productos = new ArrayList<>();
        for (ReservaStockItem item : reserva.getItems()) {
            Producto producto = productoRepository
                .findByCodigoForUpdate(item.getCodigoProducto())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede devolver el stock de "
                        + item.getCodigoProducto()
                ));
            producto.setStock(producto.getStock() + item.getCantidad());
            productos.add(producto);
        }

        productoRepository.saveAll(productos);
        reserva.setEstado(EstadoReserva.LIBERADA);
        reservaRepository.save(reserva);
    }

    private ReservaStock buscar(String orderId) {
        return reservaRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Reserva de stock no encontrada"
            ));
    }

    private List<ProductoReservadoResponse> respuesta(ReservaStock reserva) {
        return reserva.getItems().stream()
            .map(item -> new ProductoReservadoResponse(
                item.getCodigoProducto(),
                item.getNombreProducto(),
                item.getCantidad(),
                item.getPrecioUnitario()
            ))
            .toList();
    }
}
