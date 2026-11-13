package cl.gatyperry.clinica.dto;

import cl.gatyperry.clinica.model.Atencion;
import cl.gatyperry.clinica.model.EstadoRegistro;
import java.time.Instant;
import java.time.LocalDateTime;

public record AtencionResponse(
    Long id,
    Long mascotaId,
    Long citaId,
    LocalDateTime fechaAtencion,
    String motivo,
    String diagnostico,
    String tratamiento,
    String observaciones,
    String profesionalResponsable,
    Long registradoPor,
    Long actualizadoPor,
    Instant creadoEn,
    Instant actualizadoEn,
    EstadoRegistro estado,
    String motivoAnulacion,
    Long version
) {
    public static AtencionResponse from(Atencion atencion) {
        return new AtencionResponse(
            atencion.getId(),
            atencion.getMascotaId(),
            atencion.getCitaId(),
            atencion.getFechaAtencion(),
            atencion.getMotivo(),
            atencion.getDiagnostico(),
            atencion.getTratamiento(),
            atencion.getObservaciones(),
            atencion.getProfesionalResponsable(),
            atencion.getRegistradoPor(),
            atencion.getActualizadoPor(),
            atencion.getCreadoEn(),
            atencion.getActualizadoEn(),
            atencion.getEstado(),
            atencion.getMotivoAnulacion(),
            atencion.getVersion()
        );
    }
}
