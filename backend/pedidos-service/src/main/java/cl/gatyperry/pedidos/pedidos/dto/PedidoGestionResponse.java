package cl.gatyperry.pedidos.pedidos.dto;

import cl.gatyperry.pedidos.pedidos.model.Pedido;
import java.time.Instant;
import java.util.List;

public record PedidoGestionResponse(
    String id,
    Long userId,
    String customerName,
    String customerEmail,
    List<LineaPedidoResponse> items,
    Long subtotal,
    Long shipping,
    Long total,
    String deliveryMethod,
    String status,
    Instant createdAt,
    String region,
    String commune,
    String address,
    Long version
) {
    public static PedidoGestionResponse from(Pedido pedido) {
        PedidoResponse response = PedidoResponse.from(pedido);
        return new PedidoGestionResponse(
            response.id(),
            pedido.getUserId(),
            pedido.getNombreCliente(),
            pedido.getEmailCliente(),
            response.items(),
            response.subtotal(),
            response.shipping(),
            response.total(),
            response.deliveryMethod(),
            response.status(),
            response.createdAt(),
            pedido.getRegion(),
            pedido.getComuna(),
            pedido.getDireccion(),
            pedido.getVersion()
        );
    }
}
