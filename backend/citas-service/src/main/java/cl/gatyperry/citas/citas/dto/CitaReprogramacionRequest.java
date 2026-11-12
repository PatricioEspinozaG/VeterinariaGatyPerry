package cl.gatyperry.citas.citas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CitaReprogramacionRequest(
    @NotNull @PositiveOrZero Long version,
    @NotNull @Valid CitaRequest cita
) {
}