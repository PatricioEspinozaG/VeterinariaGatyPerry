package cl.gatyperry.pacientes.mascotas.dto;

import cl.gatyperry.pacientes.mascotas.model.Mascota;

public record MascotaParaCitaResponse(
    Long id,
    String userId,
    String nombre
) {
    public static MascotaParaCitaResponse from(Mascota mascota) {
        return new MascotaParaCitaResponse(
            mascota.getId(),
            mascota.getUserId(),
            mascota.getNombre()
        );
    }
}