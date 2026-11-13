package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaReprogramacionRequest;
import cl.gatyperry.citas.citas.dto.CitaRequest;
import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisponibilidadCitasTests {

    @Mock
    CitaRepository repository;

    @Mock
    MascotaClient mascotaClient;

    @Mock
    ClienteClient clienteClient;

    @InjectMocks
    CitaService citaService;

    @InjectMocks
    CitaGestionService gestionService;

    @Test
    void clienteNoPuedeReservarUnaHoraOcupada() {
        LocalDate fecha = proximoDiaHabil();
        LocalDateTime horario = LocalDateTime.of(fecha, LocalTime.of(10, 0));

        when(repository.existsByFechaHoraAndEstadoIn(
            eq(horario), anyList()
        )).thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> citaService.crear(
                1L, "token-cliente", request(fecha, LocalTime.of(10, 0))
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(mascotaClient).verificarPropiedad(21L, "token-cliente");
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void recepcionNoPuedeReservarUnaHoraOcupada() {
        LocalDate fecha = proximoDiaHabil();
        LocalDateTime horario = LocalDateTime.of(fecha, LocalTime.of(10, 0));

        when(repository.existsByFechaHoraAndEstadoIn(
            eq(horario), anyList()
        )).thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> gestionService.crear(
                1L, request(fecha, LocalTime.of(10, 0)),
                "token-recepcion"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void recepcionNoPuedeReprogramarAUnaHoraOcupada() {
        LocalDate fecha = proximoDiaHabil();
        LocalDateTime horario = LocalDateTime.of(fecha, LocalTime.of(10, 0));

        Cita cita = new Cita();
        cita.setUserId(1L);
        ReflectionTestUtils.setField(cita, "version", 0L);

        when(repository.findById(7L)).thenReturn(Optional.of(cita));
        when(repository.existsByFechaHoraAndEstadoInAndIdNot(
            eq(horario), anyList(), eq(7L)
        )).thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> gestionService.reprogramar(
                7L,
                new CitaReprogramacionRequest(
                    0L, request(fecha, LocalTime.of(10, 0))
                ),
                "token-recepcion"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any(Cita.class));
    }

    @Test
    void rechazaReservaEnDomingo() {
        LocalDate domingo = LocalDate.now(HorarioCitas.ZONA_CLINICA)
            .plusDays(1);
        while (domingo.getDayOfWeek() != DayOfWeek.SUNDAY) {
            domingo = domingo.plusDays(1);
        }

        LocalDate fecha = domingo;
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> citaService.crear(
                1L, "token-cliente", request(fecha, LocalTime.of(10, 0))
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository, mascotaClient);
    }

    private CitaRequest request(LocalDate fecha, LocalTime hora) {
        return new CitaRequest(
            21L, "Consulta General", fecha, hora, "Control"
        );
    }

    private LocalDate proximoDiaHabil() {
        LocalDate fecha = LocalDate.now(HorarioCitas.ZONA_CLINICA)
            .plusDays(1);

        while (fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {
            fecha = fecha.plusDays(1);
        }

        return fecha;
    }
}