package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.SesionRefresh;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.SesionRefreshRepository;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SesionRefreshServiceTests {

    @Mock
    SesionRefreshRepository sesiones;

    @Mock
    UsuarioRepository usuarios;

    @InjectMocks
    SesionRefreshService service;

    private Usuario usuarioActivo() {
        Usuario usuario = new Usuario();
        usuario.setId(5L);
        usuario.setEmail("prueba@example.test");
        usuario.setRol(Rol.RECEPCION);
        usuario.setActivo(true);
        return usuario;
    }

    @Test
    void creaSesionGuardandoSoloElHashDelToken() {
        Usuario usuario = usuarioActivo();
        when(usuarios.findById(5L)).thenReturn(Optional.of(usuario));

        var resultado = service.crearSesion(UsuarioResponse.from(usuario));

        ArgumentCaptor<SesionRefresh> captor =
            ArgumentCaptor.forClass(SesionRefresh.class);
        verify(sesiones).save(captor.capture());

        assertEquals(43, resultado.refreshToken().length());
        assertEquals(usuario, captor.getValue().getUsuario());
        assertNotEquals(resultado.refreshToken(), captor.getValue().getTokenHash());
        assertTrue(captor.getValue().getTokenHash().matches("[0-9a-f]{64}"));
        assertEquals(resultado.expiraEn(), captor.getValue().getExpiraEn());
    }

    @Test
    void renovarMarcaElTokenAnteriorYConservaLaFamiliaYVencimiento() {
        Usuario usuario = usuarioActivo();
        UUID familia = UUID.randomUUID();
        Instant vencimiento = Instant.now().plusSeconds(3600);
        SesionRefresh anterior = new SesionRefresh(
            usuario,
            familia,
            "a".repeat(64),
            Instant.now().minusSeconds(60),
            vencimiento
        );
        when(sesiones.buscarPorHashParaActualizar(anyString()))
            .thenReturn(Optional.of(anterior));

        var resultado = service.renovar("A".repeat(43));

        assertTrue(resultado.isPresent());
        assertNotNull(anterior.getUsadoEn());
        assertEquals(vencimiento, resultado.get().expiraEn());

        ArgumentCaptor<SesionRefresh> captor =
            ArgumentCaptor.forClass(SesionRefresh.class);
        verify(sesiones).save(captor.capture());
        assertEquals(familia, captor.getValue().getFamiliaId());
        assertEquals(vencimiento, captor.getValue().getExpiraEn());
        assertNotEquals(
            resultado.get().refreshToken(),
            captor.getValue().getTokenHash()
        );
    }

    @Test
    void reutilizarTokenUsadoRevocaSuFamilia() {
        Usuario usuario = usuarioActivo();
        UUID familia = UUID.randomUUID();
        SesionRefresh anterior = new SesionRefresh(
            usuario,
            familia,
            "b".repeat(64),
            Instant.now().minusSeconds(60),
            Instant.now().plusSeconds(3600)
        );
        anterior.marcarUsado(Instant.now().minusSeconds(10));
        when(sesiones.buscarPorHashParaActualizar(anyString()))
            .thenReturn(Optional.of(anterior));

        var resultado = service.renovar("B".repeat(43));

        assertFalse(resultado.isPresent());
        verify(sesiones).revocarFamilia(eq(familia), any(Instant.class));
    }

    @Test
    void cerrarSesionRevocaLaFamilia() {
        UUID familia = UUID.randomUUID();
        SesionRefresh sesion = new SesionRefresh(
            usuarioActivo(),
            familia,
            "c".repeat(64),
            Instant.now(),
            Instant.now().plusSeconds(3600)
        );
        when(sesiones.buscarPorHashParaActualizar(anyString()))
            .thenReturn(Optional.of(sesion));

        service.cerrarSesion("C".repeat(43));

        verify(sesiones).revocarFamilia(eq(familia), any(Instant.class));
    }

    @Test
    void rechazaTokenConFormatoInvalidoSinConsultarLaBase() {
        assertTrue(service.renovar("token-invalido").isEmpty());
        verifyNoInteractions(sesiones);
    }
}