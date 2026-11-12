package cl.gatyperry.citas.citas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record CitaRequest(
    @NotNull @Positive Long mascotaId,
    @NotBlank @Size(max = 80) String servicio,
    @NotNull LocalDate fecha,
    @NotNull LocalTime hora,
    @NotBlank @Size(max = 200) String motivo
) {
}