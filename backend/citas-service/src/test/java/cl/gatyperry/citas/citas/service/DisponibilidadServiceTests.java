package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisponibilidadServiceTests {

    @Mock
    CitaRepository repository;

    @InjectMocks
    DisponibilidadService service;

    @Test
    void excluyeLaHoraDeUnaCitaActiva() {
        LocalDate fecha = proximoDiaHabil();

        Cita ocupada = new Cita();
        ocupada.setFechaHora(fecha.atTime(10, 0));

        when(repository
            .findAllByFechaHoraGreaterThanEqualAndFechaHoraLessThanAndEstadoIn(
                any(), any(), anyList()
            )
        ).thenReturn(List.of(ocupada));

        List<LocalTime> libres = service.horasLibres(fecha);

        assertFalse(libres.contains(LocalTime.of(10, 0)));
        assertTrue(libres.contains(LocalTime.of(11, 0)));
        assertEquals(6, libres.size());
    }

    @Test
    void devuelveTodasLasHorasSiNoHayReservas() {
        LocalDate fecha = proximoDiaHabil();

        when(repository
            .findAllByFechaHoraGreaterThanEqualAndFechaHoraLessThanAndEstadoIn(
                any(), any(), anyList()
            )
        ).thenReturn(List.of());

        assertEquals(HorarioCitas.HORAS, service.horasLibres(fecha));
    }

    @Test
    void domingoNoTieneHorasDisponibles() {
        LocalDate domingo = LocalDate.now(HorarioCitas.ZONA_CLINICA)
            .plusDays(1);

        while (domingo.getDayOfWeek() != DayOfWeek.SUNDAY) {
            domingo = domingo.plusDays(1);
        }

        assertTrue(service.horasLibres(domingo).isEmpty());
        verifyNoInteractions(repository);
    }

    @Test
    void rechazaFechaPasada() {
        LocalDate ayer = LocalDate.now(HorarioCitas.ZONA_CLINICA)
            .minusDays(1);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.horasLibres(ayer)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    private LocalDate proximoDiaHabil() {
        LocalDate fecha = LocalDate.now(HorarioCitas.ZONA_CLINICA)
            .plusDays(2);

        while (fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {
            fecha = fecha.plusDays(1);
        }

        return fecha;
    }
}