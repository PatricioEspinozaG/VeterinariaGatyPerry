package cl.gatyperry.clinica.dto;

import java.util.List;

public record HistorialResponse(
    Long mascotaId,
    int limite,
    List<HistorialItem> registros
) {
}
