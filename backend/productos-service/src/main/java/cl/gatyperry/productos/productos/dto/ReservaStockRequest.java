package cl.gatyperry.productos.productos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ReservaStockRequest(
    @NotBlank @Size(max = 36) String orderId,
    @NotEmpty @Size(max = 50) List<@Valid ReservaStockLinea> items
) {
}
