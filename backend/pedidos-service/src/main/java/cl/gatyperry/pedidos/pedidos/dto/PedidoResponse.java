package cl.gatyperry.pedidos.pedidos.dto;

import cl.gatyperry.pedidos.pedidos.model.Pedido;
import java.time.Instant;
import java.util.List;

public record PedidoResponse(
    String id,
    List<LineaPedidoResponse> items,
    Long subtotal,
    Long shipping,
    Long total,
    String deliveryMethod,
    String status,
    Instant createdAt
) {
    public static PedidoResponse from(Pedido pedido) {
        List<LineaPedidoResponse> lineas = pedido.getItems().stream()
            .map(item -> new LineaPedidoResponse(
                item.getCodigoProducto(),
                item.getNombreProducto(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getTotalLinea()
            ))
            .toList();
        return new PedidoResponse(
            pedido.getId(),
            lineas,
            pedido.getSubtotal(),
            pedido.getEnvio(),
            pedido.getTotal(),
            pedido.getMetodoEntrega(),
            pedido.getEstado(),
            pedido.getCreadoEn()
        );
    }
}
