package cl.gatyperry.pedidos.pedidos.service;

import cl.gatyperry.pedidos.pedidos.model.Pedido;
import cl.gatyperry.pedidos.pedidos.model.PedidoItem;
import cl.gatyperry.pedidos.pedidos.repository.PedidoRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoPersistenceService {

    private final PedidoRepository repository;

    public PedidoPersistenceService(PedidoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Pedido guardar(
        String id,
        Long userId,
        String nombre,
        String email,
        String metodo,
        String region,
        String comuna,
        String direccion,
        long subtotal,
        long envio,
        List<ProductosClient.ProductoReservado> productos
    ) {
        Pedido pedido = new Pedido();
        pedido.setId(id);
        pedido.setUserId(userId);
        pedido.setNombreCliente(nombre);
        pedido.setEmailCliente(email);
        pedido.setMetodoEntrega(metodo);
        pedido.setRegion(region);
        pedido.setComuna(comuna);
        pedido.setDireccion(direccion);
        pedido.setSubtotal(subtotal);
        pedido.setEnvio(envio);
        pedido.setTotal(Math.addExact(subtotal, envio));
        pedido.setCreadoEn(Instant.now());

        for (var producto : productos) {
            long totalLinea = Math.multiplyExact(
                producto.unitPrice(),
                producto.quantity()
            );
            PedidoItem item = new PedidoItem();
            item.setCodigoProducto(producto.code());
            item.setNombreProducto(producto.name());
            item.setCantidad(producto.quantity());
            item.setPrecioUnitario(producto.unitPrice());
            item.setTotalLinea(totalLinea);
            pedido.addItem(item);
        }

        return repository.saveAndFlush(pedido);
    }
}
