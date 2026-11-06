package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.RegistroRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTests {

    @Mock
    UsuarioRepository repository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UsuarioService service;

    private RegistroRequest solicitud(String run, String email, String confirmPassword) {
        return new RegistroRequest(
            "Camila",
            "Pérez",
            run,
            email,
            "+56912345678",
            "Clave1234",
            confirmPassword,
            "O'Higgins",
            "Rancagua",
            "Av. Central 123"
        );
    }

    @Test
    void registraClienteConRunYCorreoNormalizadosYContrasenaCodificada() {
        when(passwordEncoder.encode("Clave1234")).thenReturn("hash-de-prueba");
        when(repository.save(any(Usuario.class)))
            .thenAnswer(invocacion -> invocacion.getArgument(0));

        UsuarioResponse respuesta = service.registrar(
            solicitud("12.345.678-5", "  CAMILA@GMAIL.COM  ", "Clave1234")
        );

        assertEquals("123456785", respuesta.run());
        assertEquals("camila@gmail.com", respuesta.email());
        assertEquals(Rol.CLIENTE, respuesta.rol());
        assertEquals(true, respuesta.activo());

        org.mockito.ArgumentCaptor<Usuario> captor =
            org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        assertEquals("hash-de-prueba", captor.getValue().getPasswordHash());
    }

    @Test
    void rechazaContrasenasDistintas() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(
                solicitud("12.345.678-5", "camila@gmail.com", "OtraClave")
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void rechazaRunInvalido() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(
                solicitud("12.345.678-9", "camila@gmail.com", "Clave1234")
            )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void rechazaCorreoDuplicado() {
        when(repository.existsByEmailIgnoreCase("camila@gmail.com"))
            .thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(
                solicitud("12.345.678-5", "CAMILA@GMAIL.COM", "Clave1234")
            )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }
    @Test
void autenticaConCorreoNormalizadoYContrasenaCorrecta() {
    Usuario usuario = new Usuario();
    usuario.setId(1L);
    usuario.setEmail("camila@gmail.com");
    usuario.setPasswordHash("hash-guardado");
    usuario.setRol(Rol.CLIENTE);
    usuario.setActivo(true);

    when(repository.findByEmailIgnoreCase("camila@gmail.com"))
        .thenReturn(Optional.of(usuario));
    when(passwordEncoder.matches("Clave1234", "hash-guardado"))
        .thenReturn(true);

    UsuarioResponse respuesta = service.autenticar(
        new cl.gatyperry.auth.usuarios.dto.LoginRequest(
            "  CAMILA@GMAIL.COM  ", "Clave1234"
        )
    );

    assertEquals(1L, respuesta.id());
    assertEquals(Rol.CLIENTE, respuesta.rol());
}

@Test
void rechazaContrasenaIncorrecta() {
    Usuario usuario = new Usuario();
    usuario.setPasswordHash("hash-guardado");
    usuario.setActivo(true);

    when(repository.findByEmailIgnoreCase("camila@gmail.com"))
        .thenReturn(Optional.of(usuario));
    when(passwordEncoder.matches("ClaveIncorrecta", "hash-guardado"))
        .thenReturn(false);

    ResponseStatusException error = assertThrows(
        ResponseStatusException.class,
        () -> service.autenticar(
            new cl.gatyperry.auth.usuarios.dto.LoginRequest(
                "camila@gmail.com", "ClaveIncorrecta"
            )
        )
    );

    assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
}

@Test
void rechazaCuentaDesactivada() {
    Usuario usuario = new Usuario();
    usuario.setPasswordHash("hash-guardado");
    usuario.setActivo(false);

    when(repository.findByEmailIgnoreCase("camila@gmail.com"))
        .thenReturn(Optional.of(usuario));
    when(passwordEncoder.matches("Clave1234", "hash-guardado"))
        .thenReturn(true);

    ResponseStatusException error = assertThrows(
        ResponseStatusException.class,
        () -> service.autenticar(
            new cl.gatyperry.auth.usuarios.dto.LoginRequest(
                "camila@gmail.com", "Clave1234"
            )
        )
    );

    assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
}
}