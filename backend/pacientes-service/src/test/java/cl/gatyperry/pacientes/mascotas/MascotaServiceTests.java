package cl.gatyperry.pacientes.mascotas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import cl.gatyperry.pacientes.mascotas.dto.MascotaRequest;
import cl.gatyperry.pacientes.mascotas.dto.MascotaResponse;
import cl.gatyperry.pacientes.mascotas.model.Mascota;
import cl.gatyperry.pacientes.mascotas.repository.MascotaRepository;
import cl.gatyperry.pacientes.mascotas.service.MascotaService;

@ExtendWith(MockitoExtension.class)
class MascotaServiceTests {

    @Mock
    private MascotaRepository repository;

    @InjectMocks
    private MascotaService service;

    @Test
    void creaMascotaYDejaQueLaBaseGenereElId() {
        MascotaRequest request = new MascotaRequest(
            "Luna", "Gato", "Mestiza", 3, "Hembra", "Control anual"
        );

        // Simula el ID que Oracle asigna al guardar.
        when(repository.save(any(Mascota.class))).thenAnswer(invocation -> {
            Mascota mascota = invocation.getArgument(0);
            mascota.setId(1L);
            return mascota;
        });

        MascotaResponse resultado = service.crear("cliente-1", request);

        assertEquals(1L, resultado.id());
        assertEquals("cliente-1", resultado.userId());
        assertEquals("Luna", resultado.nombre());
        verify(repository).save(any(Mascota.class));
    }

    @Test
    void noPermiteEliminarMascotaDeOtroUsuario() {
        when(repository.findByIdAndUserId(1L, "cliente-2"))
            .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.eliminar(1L, "cliente-2")
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).delete(any(Mascota.class));
    }

    @Test
    void actualizaMascotaDelUsuarioCorrecto() {
        Mascota mascota = new Mascota();
        mascota.setId(1L);
        mascota.setUserId("cliente-1");
        mascota.setNombre("Luna");

        MascotaRequest request = new MascotaRequest(
            "Luna", "Gato", "Mestiza", 4, "Hembra", "Control anual"
        );

        when(repository.findByIdAndUserId(1L, "cliente-1"))
            .thenReturn(Optional.of(mascota));
        when(repository.save(mascota)).thenReturn(mascota);

        MascotaResponse resultado = service.actualizar(1L, "cliente-1", request);

        assertEquals(1L, resultado.id());
        assertEquals(4, resultado.edad());
        assertEquals("Control anual", resultado.notas());
        verify(repository).save(mascota);
    }
}