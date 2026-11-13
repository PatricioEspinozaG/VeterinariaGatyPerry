package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaRequest;
import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaServiceTests {

    private static final ZoneId ZONA_CLINICA =
        ZoneId.of("America/Santiago");

    @Mock
    CitaRepository repository;

    @Mock
    MascotaClient mascotaClient;

    @InjectMocks
    CitaService service;

    @Test
    void creaCitaParaElDuenoDespuesDeVerificarMascota() {
        CitaRequest request = new CitaRequest(
            5L,
            "Consulta General",
            FechasDePrueba.diaHabilDesdeHoy(1),
            LocalTime.of(10, 0),
            "Control anual"
        );

        when(repository.saveAndFlush(any(Cita.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        var creada = service.crear(1L, "token-cliente", request);

        assertEquals(1L, creada.userId());
        assertEquals(5L, creada.mascotaId());
        assertEquals(EstadoCita.PENDIENTE, creada.estado());
        verify(mascotaClient).verificarPropiedad(5L, "token-cliente");
    }

    @Test
    void rechazaCitaEnFechaPasadaSinConsultarMascota() {
        CitaRequest request = new CitaRequest(
            5L,
            "Consulta General",
            LocalDate.now(ZONA_CLINICA).minusDays(1),
            LocalTime.of(10, 0),
            "Control anual"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(1L, "token-cliente", request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noGuardaCitaSiLaMascotaNoPerteneceAlCliente() {
        CitaRequest request = new CitaRequest(
            5L,
            "Consulta General",
            FechasDePrueba.diaHabilDesdeHoy(1),
            LocalTime.of(10, 0),
            "Control anual"
        );

        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(mascotaClient)
            .verificarPropiedad(5L, "token-cliente");

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(1L, "token-cliente", request)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noMuestraUnaCitaDeOtroUsuario() {
        when(repository.findByIdAndUserId(8L, 2L))
            .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.obtenerPropia(8L, 2L)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    }

    @Test
    void noPermiteCancelarUnaCitaCompletada() {
        Cita cita = new Cita();
        cita.setUserId(1L);
        cita.setMascotaId(5L);
        cita.setFechaHora(LocalDateTime.now(ZONA_CLINICA).plusDays(1));
        cita.setEstado(EstadoCita.COMPLETADA);

        when(repository.findByIdAndUserId(8L, 1L))
            .thenReturn(Optional.of(cita));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.cancelarPropia(8L, 1L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }
}