package cl.gatyperry.pedidos.pedidos.dto;

public record LineaPedidoResponse(
    String code,
    String name,
    Integer quantity,
    Long unitPrice,
    Long lineTotal
) {
}
