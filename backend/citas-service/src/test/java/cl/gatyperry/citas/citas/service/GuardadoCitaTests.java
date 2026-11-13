package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuardadoCitaTests {

    @Mock
    CitaRepository repository;

    @Test
    void convierteHorarioDuplicadoDePostgresEn409() {
        Cita cita = new Cita();

        SQLException postgres = new SQLException(
            "ERROR: duplicate key value violates unique constraint "
                + "\"uq_citas_horario_activo\"",
            "23505"
        );
        DataIntegrityViolationException errorBase =
            new DataIntegrityViolationException(
                "No se pudo guardar la cita",
                postgres
            );

        when(repository.saveAndFlush(cita)).thenThrow(errorBase);

        ResponseStatusException respuesta = assertThrows(
            ResponseStatusException.class,
            () -> GuardadoCita.guardar(repository, cita)
        );

        assertEquals(HttpStatus.CONFLICT, respuesta.getStatusCode());
        assertSame(errorBase, respuesta.getCause());
    }

    @Test
    void noOcultaOtrosErroresDeBaseDeDatos() {
        Cita cita = new Cita();

        SQLException postgres = new SQLException(
            "ERROR: duplicate key value violates unique constraint "
                + "\"pk_citas\"",
            "23505"
        );
        DataIntegrityViolationException errorBase =
            new DataIntegrityViolationException(
                "Falló otra restricción",
                postgres
            );

        when(repository.saveAndFlush(cita)).thenThrow(errorBase);

        DataIntegrityViolationException respuesta = assertThrows(
            DataIntegrityViolationException.class,
            () -> GuardadoCita.guardar(repository, cita)
        );

        assertSame(errorBase, respuesta);
    }
}
