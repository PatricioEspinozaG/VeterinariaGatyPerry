package cl.gatyperry.pedidos.pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;

public record LineaPedidoRequest(
    @NotBlank @Size(max = 12) String code,
    @NotNull @Positive @Max(100000) Integer quantity
) {
}
