package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.AdminUsuarioUpdateRequest;
import cl.gatyperry.auth.usuarios.dto.AdminUsuarioCreateRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUsuarioServiceTests {

    @Mock
    UsuarioRepository repository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    AdminUsuarioService service;

    @Test
    void creaRecepcionConRunValidadoYContrasenaCifrada() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));
        when(passwordEncoder.encode("claveSegura123")).thenReturn("hash-seguro");
        when(repository.save(any(Usuario.class))).thenAnswer(call -> {
            Usuario nuevo = call.getArgument(0);
            nuevo.setId(5L);
            return nuevo;
        });

        UsuarioResponse respuesta = service.crear(1L, new AdminUsuarioCreateRequest(
            "Camila", "Soto", "12.345.678-5", "CAMILA@example.test",
            "+56912345678", "claveSegura123", "O'Higgins", "Rancagua",
            "Centro", Rol.RECEPCION, true
        ));

        assertEquals(5L, respuesta.id());
        assertEquals("123456785", respuesta.run());
        assertEquals("camila@example.test", respuesta.email());
        assertEquals(Rol.RECEPCION, respuesta.rol());
        verify(repository).save(org.mockito.ArgumentMatchers.argThat(nuevo ->
            "hash-seguro".equals(nuevo.getPasswordHash())
        ));
    }

    @Test
    void rechazaCrearUsuarioSiYaExisteElRun() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));
        when(repository.existsByRun("123456785")).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
            () -> service.crear(1L, new AdminUsuarioCreateRequest(
                "Camila", "Soto", "12.345.678-5", "camila@example.test",
                "+56912345678", "claveSegura123", "O'Higgins", "Rancagua",
                null, Rol.RECEPCION, true
            )));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    private Usuario usuario(Long id, Rol rol, boolean activo) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setRol(rol);
        usuario.setActivo(activo);
        usuario.setEmail("usuario" + id + "@example.com");
        return usuario;
    }

    private AdminUsuarioUpdateRequest cambios(String email, Rol rol, boolean activo) {
        return new AdminUsuarioUpdateRequest(
            "Nombre", "Apellido", email, "+56912345678",
            "O'Higgins", "Rancagua", "Dirección", rol, activo
        );
    }

    @Test
    void rechazaTokenAdminSiElRolFueRevocadoEnBaseDeDatos() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.CLIENTE, true)));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.obtener(1L, 2L)
        );

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verify(repository, never()).findById(2L);
    }

    @Test
    void rechazaCuentaAdministradoraDesactivada() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, false)));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.obtener(1L, 2L)
        );

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
    }

    @Test
    void impideDesactivarLaPropiaCuentaAdministradora() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.desactivar(1L, 1L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void impideAsignarUnCorreoQueYaPerteneceAOtroUsuario() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));
        when(repository.findById(2L))
            .thenReturn(Optional.of(usuario(2L, Rol.CLIENTE, true)));
        when(repository.findByEmailIgnoreCase("ocupado@example.com"))
            .thenReturn(Optional.of(usuario(3L, Rol.CLIENTE, true)));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar(
                1L, 2L,
                cambios("OCUPADO@example.com", Rol.RECEPCION, true)
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void permiteCambiarUnClienteARecepcion() {
        Usuario cliente = usuario(2L, Rol.CLIENTE, true);
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));
        when(repository.findById(2L))
            .thenReturn(Optional.of(cliente));
        when(repository.save(cliente)).thenReturn(cliente);

        UsuarioResponse respuesta = service.actualizar(
            1L, 2L,
            cambios("  NUEVO@example.com  ", Rol.RECEPCION, true)
        );

        assertEquals(Rol.RECEPCION, respuesta.rol());
        assertEquals("nuevo@example.com", respuesta.email());
        verify(repository).save(cliente);
    }

    @Test
    void desactivaOtraCuentaSinBorrarSuRegistro() {
        Usuario cliente = usuario(2L, Rol.CLIENTE, true);
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));
        when(repository.findById(2L))
            .thenReturn(Optional.of(cliente));

        service.desactivar(1L, 2L);

        assertFalse(cliente.isActivo());
        verify(repository).save(cliente);
        verify(repository, never()).delete(any(Usuario.class));
    }

    @Test
    void conservaElUltimoAdministradorActivo() {
        when(repository.findById(1L))
            .thenReturn(Optional.of(usuario(1L, Rol.ADMIN, true)));
        when(repository.findById(2L))
            .thenReturn(Optional.of(usuario(2L, Rol.ADMIN, true)));
        when(repository.countByRolAndActivoTrue(Rol.ADMIN)).thenReturn(1L);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.desactivar(1L, 2L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }
}
