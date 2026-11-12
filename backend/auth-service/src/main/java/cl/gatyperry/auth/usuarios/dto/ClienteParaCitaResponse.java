package cl.gatyperry.auth.usuarios.dto;

import cl.gatyperry.auth.usuarios.model.Usuario;

public record ClienteParaCitaResponse(
    Long id,
    String nombre,
    String apellidos
) {
    public static ClienteParaCitaResponse from(Usuario usuario) {
        return new ClienteParaCitaResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getApellidos()
        );
    }
}