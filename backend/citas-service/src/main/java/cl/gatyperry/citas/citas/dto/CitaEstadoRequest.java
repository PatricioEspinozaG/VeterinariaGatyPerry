package cl.gatyperry.citas.citas.dto;

import cl.gatyperry.citas.citas.model.EstadoCita;
import jakarta.validation.constraints.NotNull;

public record CitaEstadoRequest(
    @NotNull EstadoCita estado
) {
}