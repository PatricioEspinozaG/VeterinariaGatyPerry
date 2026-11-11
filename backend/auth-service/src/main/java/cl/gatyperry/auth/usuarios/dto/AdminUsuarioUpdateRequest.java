package cl.gatyperry.auth.usuarios.dto;

import cl.gatyperry.auth.usuarios.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminUsuarioUpdateRequest(
    @NotBlank @Size(max = 80) String nombre,
    @NotBlank @Size(max = 100) String apellidos,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Size(max = 20) String telefono,
    @NotBlank @Size(max = 80) String region,
    @NotBlank @Size(max = 80) String comuna,
    @Size(max = 200) String direccion,
    @NotNull Rol rol,
    @NotNull Boolean activo
) {}