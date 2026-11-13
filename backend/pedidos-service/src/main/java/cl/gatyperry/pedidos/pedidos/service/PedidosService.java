package cl.gatyperry.pedidos.pedidos.service;

import cl.gatyperry.pedidos.pedidos.dto.PedidoRequest;
import cl.gatyperry.pedidos.pedidos.dto.PedidoResponse;
import cl.gatyperry.pedidos.pedidos.model.Pedido;
import cl.gatyperry.pedidos.pedidos.repository.PedidoRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PedidosService {

    private static final Logger LOG =
        LoggerFactory.getLogger(PedidosService.class);
    private static final long ENVIO = 3990;

    private final PedidoRepository repository;
    private final PedidoPersistenceService persistence;
    private final ProductosClient productosClient;

    public PedidosService(
        PedidoRepository repository,
        PedidoPersistenceService persistence,
        ProductosClient productosClient
    ) {
        this.repository = repository;
        this.persistence = persistence;
        this.productosClient = productosClient;
    }

    public PedidoResponse crear(
        Long userId,
        PedidoRequest request,
        String idempotencyKey
    ) {
        String orderId = idempotencyKey(idempotencyKey);
        validarEntrega(request);

        Pedido existente = repository.buscarConItems(orderId).orElse(null);
        if (existente != null) {
            validarReintento(existente, userId, request);
            productosClient.confirmar(orderId);
            return PedidoResponse.from(existente);
        }

        List<ProductosClient.LineaReserva> lineas = request.items().stream()
            .map(item -> new ProductosClient.LineaReserva(
                item.code().trim().toUpperCase(),
                item.quantity()
            ))
            .toList();
        List<ProductosClient.ProductoReservado> productos =
            productosClient.reservar(orderId, lineas);

        Entrega entrega = entrega(request);
        Pedido pedido;
        try {
            long subtotal = calcularSubtotal(productos);
            long envio = "envio".equals(entrega.metodo()) ? ENVIO : 0;
            pedido = persistence.guardar(
                orderId,
                userId,
                entrega.nombre(),
                entrega.email(),
                entrega.metodo(),
                entrega.region(),
                entrega.comuna(),
                entrega.direccion(),
                subtotal,
                envio,
                productos
            );
        } catch (DataIntegrityViolationException ex) {
            Pedido yaGuardado = repository.buscarConItems(orderId)
                .orElse(null);
            if (yaGuardado == null) {
                liberarTrasFallo(orderId, ex);
                throw ex;
            }
            validarReintento(yaGuardado, userId, request);
            productosClient.confirmar(orderId);
            return PedidoResponse.from(yaGuardado);
        } catch (RuntimeException ex) {
            liberarTrasFallo(orderId, ex);
            throw ex;
        }
        productosClient.confirmar(orderId);
        return PedidoResponse.from(pedido);
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtener(
        String id,
        Long userId,
        boolean staff
    ) {
        return repository.buscarConItems(id)
            .map(pedido -> {
                if (!staff && !Objects.equals(pedido.getUserId(), userId)) {
                    throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido no encontrado"
                    );
                }
                return PedidoResponse.from(pedido);
            })
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Pedido no encontrado"
            ));
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarPropios(Long userId) {
        return repository.findAllByUserIdOrderByCreadoEnDesc(userId)
            .stream()
            .map(PedidoResponse::from)
            .toList();
    }

    private String idempotencyKey(String key) {
        if (key == null || key.isBlank()) {
            return UUID.randomUUID().toString();
        }
        try {
            return UUID.fromString(key.trim()).toString();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Idempotency-Key debe ser un UUID válido"
            );
        }
    }

    private void validarEntrega(PedidoRequest request) {
        Entrega entrega = entrega(request);
        if (!"envio".equals(entrega.metodo())
            && !"retiro".equals(entrega.metodo())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Método de entrega no válido"
            );
        }
        if ("envio".equals(entrega.metodo())
            && (entrega.region().isBlank()
                || entrega.comuna().isBlank()
                || entrega.direccion().isBlank())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Para el envío se requiere región, comuna y dirección"
            );
        }
    }

    private Entrega entrega(PedidoRequest request) {
        var delivery = request.delivery();
        String metodo = delivery.method().trim().toLowerCase(Locale.ROOT);
        return new Entrega(
            delivery.name().trim(),
            delivery.email().trim().toLowerCase(),
            metodo,
            texto(delivery.region()),
            texto(delivery.commune()),
            texto(delivery.address())
        );
    }

    private String texto(String value) {
        return value == null ? "" : value.trim();
    }

    private long calcularSubtotal(
        List<ProductosClient.ProductoReservado> productos
    ) {
        try {
            long subtotal = 0;
            for (var producto : productos) {
                subtotal = Math.addExact(
                    subtotal,
                    Math.multiplyExact(
                        producto.unitPrice(),
                        producto.quantity()
                    )
                );
            }
            return subtotal;
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El total del pedido excede el máximo permitido"
            );
        }
    }

    private void validarReintento(
        Pedido pedido,
        Long userId,
        PedidoRequest request
    ) {
        Entrega entrega = entrega(request);
        Map<String, Integer> cantidadesSolicitadas = new HashMap<>();
        for (var linea : request.items()) {
            cantidadesSolicitadas.merge(
                linea.code().trim().toUpperCase(Locale.ROOT),
                linea.quantity(),
                Math::addExact
            );
        }
        Map<String, Integer> cantidadesGuardadas = new HashMap<>();
        for (var item : pedido.getItems()) {
            cantidadesGuardadas.put(
                item.getCodigoProducto(),
                item.getCantidad()
            );
        }

        boolean mismaEntrega = pedido.getUserId() == null
            ? userId == null
            : pedido.getUserId().equals(userId);
        mismaEntrega &= pedido.getNombreCliente().equals(entrega.nombre())
            && pedido.getEmailCliente().equals(entrega.email())
            && pedido.getMetodoEntrega().equals(entrega.metodo())
            && texto(pedido.getRegion()).equals(entrega.region())
            && texto(pedido.getComuna()).equals(entrega.comuna())
            && texto(pedido.getDireccion()).equals(entrega.direccion());

        if (!mismaEntrega || !cantidadesGuardadas.equals(cantidadesSolicitadas)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Idempotency-Key ya fue usado para otro pedido"
            );
        }
    }

    private void liberarTrasFallo(String orderId, RuntimeException original) {
        try {
            productosClient.liberar(orderId);
        } catch (RuntimeException errorLiberando) {
            original.addSuppressed(errorLiberando);
            LOG.error(
                "No se pudo liberar stock tras fallar el pedido {}",
                orderId,
                errorLiberando
            );
        }
    }

    private record Entrega(
        String nombre,
        String email,
        String metodo,
        String region,
        String comuna,
        String direccion
    ) {
    }
}
