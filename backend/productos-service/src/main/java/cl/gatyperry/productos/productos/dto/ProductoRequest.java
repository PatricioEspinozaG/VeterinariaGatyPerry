package cl.gatyperry.productos.productos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductoRequest(
    @NotBlank @Size(max = 12) String code,
    @NotBlank @Size(max = 120) String name,
    @Size(max = 60) String category,
    @Size(max = 120) String activeIngredient,
    @Size(max = 120) String presentation,
    @Size(max = 80) String species,
    @NotNull @Min(0) Integer stock,
    @NotNull @PositiveOrZero Long price,
    @Min(0) Integer criticalStock,
    @Size(max = 20) String status
) {
}
