package cl.gatyperry.pacientes.mascotas.dto;

import cl.gatyperry.pacientes.mascotas.model.Mascota;

public record MascotaResponse(
    Long id,
    String userId,
    String nombre,
    String especie,
    String raza,
    Integer edad,
    String sexo,
    String notas,
    Long version
) {
    public static MascotaResponse from(Mascota mascota) {
        return new MascotaResponse(
            mascota.getId(),
            mascota.getUserId(),
            mascota.getNombre(),
            mascota.getEspecie(),
            mascota.getRaza(),
            mascota.getEdad(),
            mascota.getSexo(),
            mascota.getNotas(),
            mascota.getVersion()
        );
    }
}