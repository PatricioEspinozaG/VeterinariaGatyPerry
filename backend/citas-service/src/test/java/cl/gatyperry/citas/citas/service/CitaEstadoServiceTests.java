package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.LocalDateTime;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaEstadoServiceTests {

    @Mock
    CitaRepository repository;

    @Mock
    ClienteClient clienteClient;

    @Mock
    MascotaClient mascotaClient;

    @InjectMocks
    CitaGestionService service;

    @Test
    void confirmaUnaCitaPendiente() {
        Cita cita = citaConEstado(EstadoCita.PENDIENTE);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));
        when(repository.save(cita)).thenReturn(cita);

        var actualizada = service.cambiarEstado(
            2L, EstadoCita.CONFIRMADA
        );

        assertEquals(EstadoCita.CONFIRMADA, actualizada.estado());
        verify(repository).save(cita);
    }

    @Test
    void completaUnaCitaConfirmada() {
        Cita cita = citaConEstado(EstadoCita.CONFIRMADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));
        when(repository.save(cita)).thenReturn(cita);

        var actualizada = service.cambiarEstado(
            2L, EstadoCita.COMPLETADA
        );

        assertEquals(EstadoCita.COMPLETADA, actualizada.estado());
    }

    @Test
    void impideSaltarDePendienteACompletada() {
        Cita cita = citaConEstado(EstadoCita.PENDIENTE);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.cambiarEstado(2L, EstadoCita.COMPLETADA)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void impideReabrirUnaCitaCancelada() {
        Cita cita = citaConEstado(EstadoCita.CANCELADA);
        when(repository.findById(2L)).thenReturn(Optional.of(cita));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.cambiarEstado(2L, EstadoCita.CONFIRMADA)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    private Cita citaConEstado(EstadoCita estado) {
        Cita cita = new Cita();
        cita.setUserId(1L);
        cita.setMascotaId(21L);
        cita.setServicio("Consulta General");
        cita.setFechaHora(LocalDateTime.now().plusDays(1));
        cita.setMotivo("Control anual");
        cita.setEstado(estado);
        return cita;
    }
}