package cl.gatyperry.citas.citas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CitaGestionRequest(
    @NotNull @Positive Long userId,
    @NotNull @Valid CitaRequest cita
) {
}