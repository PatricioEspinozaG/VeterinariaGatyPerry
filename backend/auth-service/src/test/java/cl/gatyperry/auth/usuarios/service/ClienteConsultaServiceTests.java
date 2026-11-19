package cl.gatyperry.auth.usuarios.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.gatyperry.auth.usuarios.dto.ClienteParaCitaResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClienteConsultaServiceTests {

    @Mock
    private UsuarioRepository repository;

    @InjectMocks
    private ClienteConsultaService service;

    @Test
    void listaSoloClientesActivosParaSeleccionDeCitas() {
        Usuario cliente = new Usuario();
        cliente.setId(7L);
        cliente.setNombre("Ana");
        cliente.setApellidos("Pérez");
        when(repository.findAllByRolAndActivoTrueOrderByApellidosAscNombreAsc(
            Rol.CLIENTE
        )).thenReturn(List.of(cliente));

        List<ClienteParaCitaResponse> resultado =
            service.listarClientesActivos();

        assertEquals(
            List.of(new ClienteParaCitaResponse(7L, "Ana", "Pérez")),
            resultado
        );
        verify(repository)
            .findAllByRolAndActivoTrueOrderByApellidosAscNombreAsc(Rol.CLIENTE);
    }
}
