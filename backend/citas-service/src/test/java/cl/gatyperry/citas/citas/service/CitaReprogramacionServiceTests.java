package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaReprogramacionRequest;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaReprogramacionServiceTests {

    private static final ZoneId ZONA_CLINICA =
        ZoneId.of("America/Santiago");

    @Mock
    CitaRepository repository;

    @Mock
    ClienteClient clienteClient;

    @Mock
    MascotaClient mascotaClient;

    @InjectMocks
    CitaGestionService service;

    @Test
    void reprogramaSinCambiarDuenoNiEstado() {
        Cita cita = citaExistente(EstadoCita.CONFIRMADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));
        when(repository.saveAndFlush(cita)).thenReturn(cita);

        var resultado = service.reprogramar(
            2L,
            new CitaReprogramacionRequest(1L, datosFuturos(21L)),
            "token-recepcion"
        );

        assertEquals(1L, resultado.userId());
        assertEquals(EstadoCita.CONFIRMADA, resultado.estado());
        assertEquals(
            FechasDePrueba.diaHabilDesdeHoy(2),
            resultado.fecha()
        );
        verify(clienteClient).verificarClienteActivo(
            1L, "token-recepcion"
        );
        verify(mascotaClient).verificarPropiedadParaPersonal(
            21L, 1L, "token-recepcion"
        );
    }

    @Test
    void rechazaUnaVersionDesactualizada() {
        Cita cita = citaExistente(EstadoCita.CONFIRMADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.reprogramar(
                2L,
                new CitaReprogramacionRequest(0L, datosFuturos(21L)),
                "token-recepcion"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verifyNoInteractions(clienteClient, mascotaClient);
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noReprogramaUnaCitaCancelada() {
        Cita cita = citaExistente(EstadoCita.CANCELADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.reprogramar(
                2L,
                new CitaReprogramacionRequest(1L, datosFuturos(21L)),
                "token-recepcion"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verifyNoInteractions(clienteClient, mascotaClient);
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noGuardaUnaMascotaDeOtroCliente() {
        Cita cita = citaExistente(EstadoCita.CONFIRMADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));

        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(mascotaClient)
            .verificarPropiedadParaPersonal(
                999L, 1L, "token-recepcion"
            );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.reprogramar(
                2L,
                new CitaReprogramacionRequest(1L, datosFuturos(999L)),
                "token-recepcion"
            )
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void rechazaFechaPasadaSinLlamarAOtrosServicios() {
        Cita cita = citaExistente(EstadoCita.CONFIRMADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));

        CitaRequest datosPasados = new CitaRequest(
            21L,
            "Consulta General",
            LocalDate.now(ZONA_CLINICA).minusDays(1),
            LocalTime.of(10, 0),
            "Control anual"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.reprogramar(
                2L,
                new CitaReprogramacionRequest(1L, datosPasados),
                "token-recepcion"
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(clienteClient, mascotaClient);
        verify(repository, never()).save(any(Cita.class));
    }

    private Cita citaExistente(EstadoCita estado) {
        Cita cita = new Cita();
        cita.setUserId(1L);
        cita.setMascotaId(21L);
        cita.setServicio("Consulta General");
        cita.setFechaHora(
            LocalDateTime.now(ZONA_CLINICA).plusDays(1)
        );
        cita.setMotivo("Control anual");
        cita.setEstado(estado);
        ReflectionTestUtils.setField(cita, "version", 1L);
        return cita;
    }

    private CitaRequest datosFuturos(Long mascotaId) {
        return new CitaRequest(
            mascotaId,
            "Consulta General",
            FechasDePrueba.diaHabilDesdeHoy(2),
            LocalTime.of(12, 0),
            "Control reprogramado"
        );
    }
}