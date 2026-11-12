package cl.gatyperry.pedidos.pedidos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EntregaRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Pattern(regexp = "envio|retiro") String method,
    @Size(max = 80) String region,
    @Size(max = 80) String commune,
    @Size(max = 200) String address
) {
}
