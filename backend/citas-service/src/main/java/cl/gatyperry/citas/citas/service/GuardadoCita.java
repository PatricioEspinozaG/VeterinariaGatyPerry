package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.sql.SQLException;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class GuardadoCita {

    private static final String INDICE_HORARIO =
        "UQ_CITAS_HORARIO_ACTIVO";

    private GuardadoCita() {
    }

    static Cita guardar(CitaRepository repository, Cita cita) {
        try {
            return repository.saveAndFlush(cita);
        } catch (DataIntegrityViolationException error) {
            if (esHorarioDuplicado(error)) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El horario ya está reservado",
                    error
                );
            }
            throw error;
        }
    }

    private static boolean esHorarioDuplicado(Throwable error) {
        boolean indiceEncontrado = false;
        boolean errorUnicidad = false;

        for (Throwable causa = error; causa != null;
             causa = causa.getCause()) {
            String mensaje = causa.getMessage();

            if (mensaje != null
                && mensaje.toUpperCase(Locale.ROOT)
                    .contains(INDICE_HORARIO)) {
                indiceEncontrado = true;
            }

            if (causa instanceof SQLException sql
                && "23505".equals(sql.getSQLState())) {
                errorUnicidad = true;
            }
        }

        return indiceEncontrado && errorUnicidad;
    }
}
