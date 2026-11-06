package cl.gatyperry.pacientes.mascotas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MascotaRequest(
    @NotBlank @Size(max = 30) String nombre,
    @NotBlank @Size(max = 30) String especie,
    @NotBlank @Size(max = 30) String raza,
    @NotNull @Min(0) @Max(30) Integer edad,
    @Size(max = 10) String sexo,
    @Size(max = 500) String notas
) {
}