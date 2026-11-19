package cl.gatyperry.pacientes.mascotas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.gatyperry.pacientes.mascotas.dto.MascotaParaCitaResponse;
import cl.gatyperry.pacientes.mascotas.model.Mascota;
import cl.gatyperry.pacientes.mascotas.repository.MascotaRepository;
import cl.gatyperry.pacientes.mascotas.service.MascotaGestionService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MascotaGestionServiceTests {

    @Mock
    private MascotaRepository repository;

    @InjectMocks
    private MascotaGestionService service;

    @Test
    void listaMascotasSoloDelClienteSeleccionado() {
        Mascota mascota = new Mascota();
        mascota.setId(10L);
        mascota.setUserId("7");
        mascota.setNombre("Luna");
        when(repository.findAllByUserIdOrderByNombreAsc("7"))
            .thenReturn(List.of(mascota));

        List<MascotaParaCitaResponse> resultado = service.listarPorCliente(7L);

        assertEquals(
            List.of(new MascotaParaCitaResponse(10L, "7", "Luna")),
            resultado
        );
        verify(repository).findAllByUserIdOrderByNombreAsc("7");
    }
}
