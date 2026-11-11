package cl.gatyperry.auth.usuarios.dto;

public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UsuarioResponse usuario
) {}