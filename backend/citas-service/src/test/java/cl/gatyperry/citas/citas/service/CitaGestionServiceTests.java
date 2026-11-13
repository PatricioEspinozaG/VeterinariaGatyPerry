package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaRequest;
import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
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
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaGestionServiceTests {

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
    void creaCitaSoloDespuesDeVerificarClienteYMascota() {
        CitaRequest request = citaFutura();

        when(repository.saveAndFlush(any(Cita.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        var creada = service.crear(1L, request, "token-recepcion");

        assertEquals(1L, creada.userId());
        assertEquals(21L, creada.mascotaId());
        assertEquals(EstadoCita.PENDIENTE, creada.estado());
        verify(clienteClient).verificarClienteActivo(1L, "token-recepcion");
        verify(mascotaClient).verificarPropiedadParaPersonal(
            21L, 1L, "token-recepcion"
        );
    }

    @Test
    void noGuardaSiElClienteNoEstaActivo() {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(clienteClient)
            .verificarClienteActivo(1L, "token-recepcion");

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(1L, citaFutura(), "token-recepcion")
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(mascotaClient);
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noGuardaSiLaMascotaNoPerteneceAlCliente() {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(mascotaClient)
            .verificarPropiedadParaPersonal(21L, 1L, "token-recepcion");

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(1L, citaFutura(), "token-recepcion")
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void rechazaFechaPasadaAntesDeLlamarAOtrosServicios() {
        CitaRequest request = new CitaRequest(
            21L,
            "Consulta General",
            LocalDate.now(ZONA_CLINICA).minusDays(1),
            LocalTime.of(10, 0),
            "Control anual"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(1L, request, "token-recepcion")
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(clienteClient, mascotaClient);
        verify(repository, never()).save(any(Cita.class));
    }

    private CitaRequest citaFutura() {
        return new CitaRequest(
            21L,
            "Consulta General",
            FechasDePrueba.diaHabilDesdeHoy(1),
            LocalTime.of(10, 0),
            "Control anual"
        );
    }
}