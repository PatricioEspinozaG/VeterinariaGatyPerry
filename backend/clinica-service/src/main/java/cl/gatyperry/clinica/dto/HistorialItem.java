package cl.gatyperry.clinica.dto;

import cl.gatyperry.clinica.model.EstadoRegistro;
import java.time.LocalDateTime;

public record HistorialItem(
    Long id,
    String tipo,
    LocalDateTime fecha,
    EstadoRegistro estado,
    String motivo,
    String diagnostico,
    String tratamiento,
    String nombreVacuna,
    String profesionalResponsable
) {
}
