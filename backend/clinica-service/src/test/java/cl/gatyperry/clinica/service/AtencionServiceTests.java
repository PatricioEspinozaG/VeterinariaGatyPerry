package cl.gatyperry.clinica.service;

import cl.gatyperry.clinica.dto.AtencionCrearRequest;
import cl.gatyperry.clinica.dto.VacunaCrearRequest;
import cl.gatyperry.clinica.model.Atencion;
import cl.gatyperry.clinica.repository.AtencionRepository;
import cl.gatyperry.clinica.repository.VacunaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AtencionServiceTests {

    private static final ZoneId ZONA_CLINICA = ZoneId.of("America/Santiago");

    @Mock
    AtencionRepository atencionRepository;

    @Mock
    VacunaRepository vacunaRepository;

    @Mock
    MascotaClient mascotaClient;

    @Mock
    CitaClient citaClient;

    @InjectMocks
    AtencionService service;

    @Test
    void creaAtencionYRegistraLaIdentidadDelJwt() {
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        when(atencionRepository.saveAndFlush(any(Atencion.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.crear(
            new AtencionCrearRequest(
                42L,
                null,
                LocalDateTime.of(2026, 10, 12, 10, 30),
                "  Control  ",
                "  Diagnóstico  ",
                null,
                "  Nota  ",
                " Dra. Ejemplo "
            ),
            7L,
            "token-admin"
        );

        assertEquals(42L, response.mascotaId());
        assertEquals(7L, response.registradoPor());
        assertEquals(7L, response.actualizadoPor());
        assertEquals("Control", response.motivo());
        assertEquals("Diagnóstico", response.diagnostico());
        assertEquals("Nota", response.observaciones());
        verifyNoInteractions(citaClient);
    }

    @Test
    void noRegistraAtencionSiLaCitaEsDeOtraMascota() {
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        when(citaClient.obtener(73L, "token-admin"))
            .thenReturn(new CitaClient.CitaRemota(
                73L,
                7L,
                99L,
                "CONFIRMADA"
            ));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(
                solicitudConCita(42L, 73L),
                7L,
                "token-admin"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(atencionRepository, never()).saveAndFlush(any());
    }

    @Test
    void noRegistraAtencionSiLaCitaFueCancelada() {
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        when(citaClient.obtener(73L, "token-admin"))
            .thenReturn(new CitaClient.CitaRemota(
                73L,
                7L,
                42L,
                "CANCELADA"
            ));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(
                solicitudConCita(42L, 73L),
                7L,
                "token-admin"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(atencionRepository, never()).saveAndFlush(any());
    }

    @Test
    void rechazaVacunaConFechaFutura() {
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        LocalDate futura = LocalDate.now(ZONA_CLINICA).plusDays(1);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crearVacuna(
                new VacunaCrearRequest(
                    42L,
                    null,
                    "Vacuna de prueba",
                    futura,
                    "Dra. Ejemplo",
                    null,
                    null,
                    null
                ),
                7L,
                "token-admin"
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(vacunaRepository, never()).saveAndFlush(any());
    }

    @Test
    void rechazaProximaDosisNoPosteriorALaAplicacion() {
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        LocalDate aplicacion = LocalDate.now(ZONA_CLINICA).minusDays(5);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crearVacuna(
                new VacunaCrearRequest(
                    42L,
                    null,
                    "Vacuna de prueba",
                    aplicacion,
                    "Dra. Ejemplo",
                    null,
                    null,
                    aplicacion
                ),
                7L,
                "token-admin"
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(vacunaRepository, never()).saveAndFlush(any());
    }

    @Test
    void creaVacunaConAtencionDeLaMismaMascota() {
        Atencion atencion = new Atencion();
        atencion.setMascotaId(42L);
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        when(atencionRepository.findById(12L))
            .thenReturn(Optional.of(atencion));
        when(vacunaRepository.saveAndFlush(any()))
            .thenAnswer(invocation -> invocation.getArgument(0));
        LocalDate aplicacion = LocalDate.now(ZONA_CLINICA).minusDays(1);

        var response = service.crearVacuna(
            new VacunaCrearRequest(
                42L,
                12L,
                "Vacuna de prueba",
                aplicacion,
                "Dra. Ejemplo",
                "L-123",
                null,
                aplicacion.plusDays(30)
            ),
            7L,
            "token-admin"
        );

        assertEquals(42L, response.mascotaId());
        assertEquals(12L, response.atencionId());
        assertEquals(7L, response.registradoPor());
        assertEquals(aplicacion, response.fechaAplicacion());
    }

    @Test
    void rechazaAtencionDeOtraMascotaAlVincularVacuna() {
        Atencion atencion = new Atencion();
        atencion.setMascotaId(99L);
        when(mascotaClient.verificarParaPersonal(42L, "token-admin"))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        when(atencionRepository.findById(12L))
            .thenReturn(Optional.of(atencion));
        LocalDate aplicacion = LocalDate.now(ZONA_CLINICA).minusDays(1);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crearVacuna(
                new VacunaCrearRequest(
                    42L,
                    12L,
                    "Vacuna de prueba",
                    aplicacion,
                    "Dra. Ejemplo",
                    null,
                    null,
                    null
                ),
                7L,
                "token-admin"
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(vacunaRepository, never()).saveAndFlush(any());
    }

    @Test
    void propagaMascotaInexistenteSinGuardar() {
        org.mockito.Mockito.doThrow(new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Mascota no encontrada"
        )).when(mascotaClient)
            .verificarParaPersonal(42L, "token-admin");

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(
                solicitudConCita(42L, null),
                7L,
                "token-admin"
            )
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(citaClient);
        verify(atencionRepository, never()).saveAndFlush(any());
    }

    private AtencionCrearRequest solicitudConCita(Long mascotaId, Long citaId) {
        return new AtencionCrearRequest(
            mascotaId,
            citaId,
            LocalDateTime.of(2026, 10, 12, 10, 30),
            "Control",
            "Diagnóstico",
            null,
            null,
            "Dra. Ejemplo"
        );
    }
}
