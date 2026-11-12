package cl.gatyperry.citas.citas.dto;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import java.time.LocalDate;
import java.time.LocalTime;

public record CitaResponse(
    Long id,
    Long userId,
    Long mascotaId,
    String servicio,
    LocalDate fecha,
    LocalTime hora,
    String motivo,
    EstadoCita estado,
    Long version
) {
    public static CitaResponse from(Cita cita) {
        return new CitaResponse(
            cita.getId(),
            cita.getUserId(),
            cita.getMascotaId(),
            cita.getServicio(),
            cita.getFechaHora().toLocalDate(),
            cita.getFechaHora().toLocalTime(),
            cita.getMotivo(),
            cita.getEstado(),
            cita.getVersion()
        );
    }
}