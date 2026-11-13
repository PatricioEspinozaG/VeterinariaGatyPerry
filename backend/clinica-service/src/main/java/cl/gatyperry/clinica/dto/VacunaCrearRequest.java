package cl.gatyperry.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record VacunaCrearRequest(
    @NotNull @Positive Long mascotaId,
    @Positive Long atencionId,
    @NotBlank @Size(max = 160) String nombreVacuna,
    @NotNull LocalDate fechaAplicacion,
    @NotBlank @Size(max = 120) String profesionalResponsable,
    @Size(max = 120) String lote,
    @Size(max = 2000) String observaciones,
    LocalDate proximaDosis
) {
}
