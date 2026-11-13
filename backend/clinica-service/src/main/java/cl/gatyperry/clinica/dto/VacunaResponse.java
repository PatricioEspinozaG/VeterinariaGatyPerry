package cl.gatyperry.clinica.dto;

import cl.gatyperry.clinica.model.EstadoRegistro;
import cl.gatyperry.clinica.model.Vacuna;
import java.time.Instant;
import java.time.LocalDate;

public record VacunaResponse(
    Long id,
    Long mascotaId,
    Long atencionId,
    String nombreVacuna,
    LocalDate fechaAplicacion,
    String profesionalResponsable,
    String lote,
    String observaciones,
    LocalDate proximaDosis,
    Long registradoPor,
    Long actualizadoPor,
    Instant creadoEn,
    Instant actualizadoEn,
    EstadoRegistro estado,
    String motivoAnulacion,
    Long version
) {
    public static VacunaResponse from(Vacuna vacuna) {
        return new VacunaResponse(
            vacuna.getId(),
            vacuna.getMascotaId(),
            vacuna.getAtencionId(),
            vacuna.getNombreVacuna(),
            vacuna.getFechaAplicacion(),
            vacuna.getProfesionalResponsable(),
            vacuna.getLote(),
            vacuna.getObservaciones(),
            vacuna.getProximaDosis(),
            vacuna.getRegistradoPor(),
            vacuna.getActualizadoPor(),
            vacuna.getCreadoEn(),
            vacuna.getActualizadoEn(),
            vacuna.getEstado(),
            vacuna.getMotivoAnulacion(),
            vacuna.getVersion()
        );
    }
}
