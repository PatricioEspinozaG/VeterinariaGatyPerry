package cl.gatyperry.pedidos.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PedidoRequest(
    @NotEmpty @Size(max = 50) List<@Valid LineaPedidoRequest> items,
    @NotNull @Valid EntregaRequest delivery
) {
}
