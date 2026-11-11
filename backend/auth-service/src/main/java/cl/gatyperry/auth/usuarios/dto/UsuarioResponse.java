package cl.gatyperry.auth.usuarios.dto;

import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.Usuario;

public record UsuarioResponse(
    Long id,
    String run,
    String nombre,
    String apellidos,
    String email,
    String telefono,
    String region,
    String comuna,
    String direccion,
    Rol rol,
    boolean activo
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getRun(),
            usuario.getNombre(),
            usuario.getApellidos(),
            usuario.getEmail(),
            usuario.getTelefono(),
            usuario.getRegion(),
            usuario.getComuna(),
            usuario.getDireccion(),
            usuario.getRol(),
            usuario.isActivo()
        );
    }
}