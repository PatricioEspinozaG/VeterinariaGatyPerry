package cl.gatyperry.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record AtencionActualizarRequest(
    @NotNull @PositiveOrZero Long version,
    @NotNull LocalDateTime fechaAtencion,
    @NotBlank @Size(max = 200) String motivo,
    @NotBlank @Size(max = 2000) String diagnostico,
    @Size(max = 2000) String tratamiento,
    @Size(max = 4000) String observaciones,
    @NotBlank @Size(max = 120) String profesionalResponsable
) {
}
