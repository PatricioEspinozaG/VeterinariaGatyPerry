package cl.gatyperry.productos.productos.dto;

public record ProductoReservadoResponse(
    String code,
    String name,
    Integer quantity,
    Long unitPrice
) {
}
