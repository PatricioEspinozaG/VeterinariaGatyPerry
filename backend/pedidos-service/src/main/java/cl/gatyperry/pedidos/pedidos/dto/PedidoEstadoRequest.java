package cl.gatyperry.pedidos.pedidos.dto;

import cl.gatyperry.pedidos.pedidos.model.EstadoPedido;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record PedidoEstadoRequest(
    @NotNull EstadoPedido estado,
    @NotNull @PositiveOrZero Long version
) {
}
