package cl.gatyperry.citas.citas.service;

import java.time.DayOfWeek;
import java.time.LocalDate;

final class FechasDePrueba {

    private FechasDePrueba() {
    }

    static LocalDate diaHabilDesdeHoy(int dias) {
        LocalDate fecha = LocalDate.now(HorarioCitas.ZONA_CLINICA)
            .plusDays(dias);

        while (fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {
            fecha = fecha.plusDays(1);
        }

        return fecha;
    }
}