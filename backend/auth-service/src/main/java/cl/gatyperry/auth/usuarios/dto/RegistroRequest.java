package cl.gatyperry.auth.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
    @NotBlank @Size(max = 80) String nombre,
    @NotBlank @Size(max = 100) String apellidos,
    @NotBlank @Size(max = 16) String run,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Size(max = 20) String telefono,
    @NotBlank @Size(min = 8, max = 64) String password,
    @NotBlank String confirmPassword,
    @NotBlank @Size(max = 80) String region,
    @NotBlank @Size(max = 80) String comuna,
    @Size(max = 200) String direccion
) {
}