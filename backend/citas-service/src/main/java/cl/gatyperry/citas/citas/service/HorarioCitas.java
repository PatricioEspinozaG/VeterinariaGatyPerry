package cl.gatyperry.citas.citas.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class HorarioCitas {

    static final ZoneId ZONA_CLINICA = ZoneId.of("America/Santiago");

    static final List<LocalTime> HORAS = List.of(
        LocalTime.of(9, 0),
        LocalTime.of(10, 0),
        LocalTime.of(11, 0),
        LocalTime.of(12, 0),
        LocalTime.of(15, 0),
        LocalTime.of(16, 0),
        LocalTime.of(17, 0)
    );

    private HorarioCitas() {
    }

    static LocalDateTime validar(LocalDate fecha, LocalTime hora) {
        if (fecha == null || hora == null
            || fecha.getDayOfWeek() == DayOfWeek.SUNDAY
            || !HORAS.contains(hora)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Horario de atención no disponible"
            );
        }

        LocalDateTime fechaHora = LocalDateTime.of(fecha, hora);

        if (!fechaHora.isAfter(LocalDateTime.now(ZONA_CLINICA))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La fecha y hora deben ser futuras"
            );
        }

        return fechaHora;
    }

    static void exigirLibre(boolean ocupada) {
        if (ocupada) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El horario ya está reservado"
            );
        }
    }
}