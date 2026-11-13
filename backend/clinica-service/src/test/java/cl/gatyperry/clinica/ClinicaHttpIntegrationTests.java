package cl.gatyperry.clinica;

import cl.gatyperry.clinica.model.Atencion;
import cl.gatyperry.clinica.model.Vacuna;
import cl.gatyperry.clinica.repository.AtencionRepository;
import cl.gatyperry.clinica.repository.VacunaRepository;
import cl.gatyperry.clinica.service.CitaClient;
import cl.gatyperry.clinica.service.DependenciaRemotaException;
import cl.gatyperry.clinica.service.MascotaClient;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URI;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class ClinicaHttpIntegrationTests {

    private static final KeyPair TEST_KEY_PAIR = createKeyPair();
    private static final Path PUBLIC_KEY_FILE = createPublicKeyFile();

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
        new PostgreSQLContainer<>("postgres:17");

    @Autowired
    MockMvc mockMvc;

    @Autowired
    AtencionRepository atencionRepository;

    @Autowired
    VacunaRepository vacunaRepository;

    @MockitoBean
    MascotaClient mascotaClient;

    @MockitoBean
    CitaClient citaClient;

    @BeforeEach
    void limpiar() {
        vacunaRepository.deleteAll();
        atencionRepository.deleteAll();
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add(
            "app.jwt.public-key",
            () -> PUBLIC_KEY_FILE.toUri().toString()
        );
    }

    @Test
    void healthYFlywayEstanDisponiblesSobrePostgres() {
        ResponseEntity<String> health = exchange(
            HttpMethod.GET,
            "/actuator/health",
            null,
            null
        );

        assertEquals(HttpStatus.OK, health.getStatusCode());
        assertTrue(health.getBody().contains("\"status\":\"UP\""));
        assertEquals(0, atencionRepository.count());
    }

    @Test
    void adminPuedeRegistrarVacunaYSeGuardaLaAuditoria() {
        when(mascotaClient.verificarParaPersonal(42L, anyString()))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        String fecha = java.time.LocalDate.now(
            java.time.ZoneId.of("America/Santiago")
        ).minusDays(1).toString();
        ResponseEntity<String> response = post(
            "/api/v1/clinica/gestion/vacunas",
            token("ADMIN", Instant.now().plusSeconds(120)),
            """
                {
                  "mascotaId": 42,
                  "nombreVacuna": "Vacuna de prueba",
                  "fechaAplicacion": "%s",
                  "profesionalResponsable": "Dra. Ejemplo"
                }
                """.formatted(fecha)
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        Vacuna guardada = vacunaRepository.findAll().get(0);
        assertEquals(42L, guardada.getMascotaId());
        assertEquals("Vacuna de prueba", guardada.getNombreVacuna());
        assertEquals(7L, guardada.getRegistradoPor());
        assertEquals(7L, guardada.getActualizadoPor());
    }

    @Test
    void validaFechaFuturaDeVacunaEnLaApi() {
        when(mascotaClient.verificarParaPersonal(42L, anyString()))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        String fechaFutura = java.time.LocalDate.now(
            java.time.ZoneId.of("America/Santiago")
        ).plusDays(1).toString();
        ResponseEntity<String> response = post(
            "/api/v1/clinica/gestion/vacunas",
            token("ADMIN", Instant.now().plusSeconds(120)),
            """
                {
                  "mascotaId": 42,
                  "nombreVacuna": "Vacuna de prueba",
                  "fechaAplicacion": "%s",
                  "profesionalResponsable": "Dra. Ejemplo"
                }
                """.formatted(fechaFutura)
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(0, vacunaRepository.count());
    }

    @Test
    void rechazaJwtAusenteExpiradoEInvalido() {
        ResponseEntity<String> ausente = exchange(
            HttpMethod.GET,
            "/api/v1/clinica/mascotas/42/historial",
            null,
            null
        );
        ResponseEntity<String> expirado = get(
            "/api/v1/clinica/mascotas/42/historial",
            token("CLIENTE", Instant.now().minusSeconds(120))
        );
        ResponseEntity<String> invalido = get(
            "/api/v1/clinica/mascotas/42/historial",
            "token-invalido"
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ausente.getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, expirado.getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, invalido.getStatusCode());
    }

    @Test
    void adminPuedeCrearAtencionYSeGuardaLaAuditoria() {
        when(mascotaClient.verificarParaPersonal(42L, anyString()))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        String body = """
            {
              "mascotaId": 42,
              "fechaAtencion": "2026-10-12T10:30:00",
              "motivo": "Control general",
              "diagnostico": "Buen estado",
              "profesionalResponsable": "Dra. Ejemplo"
            }
            """;

        ResponseEntity<String> response = post(
            "/api/v1/clinica/gestion/atenciones",
            token("ADMIN", Instant.now().plusSeconds(120)),
            body
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getHeaders().getLocation().toString()
            .contains("/api/v1/clinica/atenciones/"));
        Atencion guardada = atencionRepository.findAll().get(0);
        assertEquals(42L, guardada.getMascotaId());
        assertEquals(7L, guardada.getRegistradoPor());
        assertEquals(7L, guardada.getActualizadoPor());
        assertEquals("Control general", guardada.getMotivo());
    }

    @Test
    void clienteConsultaSuHistorialPeroNoPuedeConsultarUnoAjenoNiEscribir() {
        Atencion propia = atencion(42L);
        atencionRepository.saveAndFlush(propia);
        doThrow(new org.springframework.web.server.ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Mascota no encontrada para este usuario"
        )).when(mascotaClient)
            .verificarPropiedad(eq(99L), eq(7L), anyString());

        ResponseEntity<String> historial = get(
            "/api/v1/clinica/mascotas/42/historial",
            token("CLIENTE", Instant.now().plusSeconds(120))
        );
        ResponseEntity<String> ajena = get(
            "/api/v1/clinica/mascotas/99/historial",
            token("CLIENTE", Instant.now().plusSeconds(120))
        );
        ResponseEntity<String> escritura = post(
            "/api/v1/clinica/gestion/atenciones",
            token("CLIENTE", Instant.now().plusSeconds(120)),
            "{}"
        );

        assertEquals(HttpStatus.OK, historial.getStatusCode());
        assertTrue(historial.getBody().contains("\"tipo\":\"ATENCION\""));
        assertEquals(HttpStatus.NOT_FOUND, ajena.getStatusCode());
        assertEquals(HttpStatus.FORBIDDEN, escritura.getStatusCode());
    }

    @Test
    void historialMezclaAtencionesYVacunasEnOrdenDescendente() {
        atencionRepository.saveAndFlush(atencion(42L));
        Vacuna vacuna = new Vacuna();
        vacuna.setMascotaId(42L);
        vacuna.setNombreVacuna("Vacuna de prueba");
        vacuna.setFechaAplicacion(
            java.time.LocalDate.of(2026, 11, 1)
        );
        vacuna.setProfesionalResponsable("Dra. Ejemplo");
        vacuna.registrar(7L);
        vacunaRepository.saveAndFlush(vacuna);

        ResponseEntity<String> response = get(
            "/api/v1/clinica/mascotas/42/historial",
            token("CLIENTE", Instant.now().plusSeconds(120))
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().indexOf("VACUNA")
            < response.getBody().indexOf("ATENCION"));
    }

    @Test
    void rechazaCitasDeOtraMascota() {
        when(mascotaClient.verificarParaPersonal(42L, anyString()))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        when(citaClient.obtener(73L, anyString()))
            .thenReturn(new CitaClient.CitaRemota(
                73L,
                7L,
                99L,
                "CONFIRMADA"
            ));

        ResponseEntity<String> response = post(
            "/api/v1/clinica/gestion/atenciones",
            token("ADMIN", Instant.now().plusSeconds(120)),
            """
                {
                  "mascotaId": 42,
                  "citaId": 73,
                  "fechaAtencion": "2026-10-12T10:30:00",
                  "motivo": "Control",
                  "diagnostico": "Buen estado",
                  "profesionalResponsable": "Dra. Ejemplo"
                }
                """
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(0, atencionRepository.count());
    }

    @Test
    void validaDatosYConflictoDeVersion() {
        ResponseEntity<String> invalido = post(
            "/api/v1/clinica/gestion/atenciones",
            token("ADMIN", Instant.now().plusSeconds(120)),
            "{}"
        );
        when(mascotaClient.verificarParaPersonal(42L, anyString()))
            .thenReturn(new MascotaClient.MascotaRemota(42L, "7", "Luna"));
        ResponseEntity<String> creado = post(
            "/api/v1/clinica/gestion/atenciones",
            token("ADMIN", Instant.now().plusSeconds(120)),
            """
                {
                  "mascotaId": 42,
                  "fechaAtencion": "2026-10-12T10:30:00",
                  "motivo": "Control",
                  "diagnostico": "Buen estado",
                  "profesionalResponsable": "Dra. Ejemplo"
                }
                """
        );
        long id = atencionRepository.findAll().get(0).getId();
        ResponseEntity<String> conflicto = put(
            "/api/v1/clinica/gestion/atenciones/" + id,
            token("ADMIN", Instant.now().plusSeconds(120)),
            """
                {
                  "version": 99,
                  "fechaAtencion": "2026-10-12T10:30:00",
                  "motivo": "Control",
                  "diagnostico": "Buen estado",
                  "profesionalResponsable": "Dra. Ejemplo"
                }
                """
        );

        assertEquals(HttpStatus.BAD_REQUEST, invalido.getStatusCode());
        assertEquals(HttpStatus.CREATED, creado.getStatusCode());
        assertEquals(HttpStatus.CONFLICT, conflicto.getStatusCode());
    }

    @Test
    void anulaSinEliminarYRequiereMotivo() {
        Atencion guardada = atencionRepository.saveAndFlush(atencion(42L));
        long id = guardada.getId();
        String admin = token("ADMIN", Instant.now().plusSeconds(120));
        ResponseEntity<String> sinMotivo = patch(
            "/api/v1/clinica/gestion/atenciones/" + id + "/anulacion",
            admin,
            "{\"motivo\":\" \",\"version\":0}"
        );
        ResponseEntity<String> anulada = patch(
            "/api/v1/clinica/gestion/atenciones/" + id + "/anulacion",
            admin,
            "{\"motivo\":\"Duplicado\",\"version\":0}"
        );

        assertEquals(HttpStatus.BAD_REQUEST, sinMotivo.getStatusCode());
        assertEquals(HttpStatus.OK, anulada.getStatusCode());
        assertEquals(1, atencionRepository.count());
        Atencion persistida = atencionRepository.findById(id).orElseThrow();
        assertEquals("ANULADA", persistida.getEstado().name());
        assertEquals("Duplicado", persistida.getMotivoAnulacion());
    }

    @Test
    void fallaEnFormaControladaCuandoPacientesNoResponde() {
        doThrow(new DependenciaRemotaException("Pacientes no disponible"))
            .when(mascotaClient)
            .verificarPropiedad(eq(42L), eq(7L), anyString());

        ResponseEntity<String> response = get(
            "/api/v1/clinica/mascotas/42/historial",
            token("CLIENTE", Instant.now().plusSeconds(120))
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    }

    @Test
    void swaggerDescribeRutasYEsquemaBearer() {
        ResponseEntity<String> response = get(
            "/v3/api-docs",
            token("ADMIN", Instant.now().plusSeconds(120))
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("/api/v1/clinica/gestion/vacunas"));
        assertTrue(response.getBody().contains("bearer-jwt"));
    }

    private ResponseEntity<String> get(String path, String token) {
        return exchange(HttpMethod.GET, path, token, null);
    }

    private ResponseEntity<String> post(
        String path,
        String token,
        String body
    ) {
        return exchange(HttpMethod.POST, path, token, body);
    }

    private ResponseEntity<String> put(
        String path,
        String token,
        String body
    ) {
        return exchange(HttpMethod.PUT, path, token, body);
    }

    private ResponseEntity<String> patch(
        String path,
        String token,
        String body
    ) {
        return exchange(HttpMethod.PATCH, path, token, body);
    }

    private ResponseEntity<String> exchange(
        HttpMethod method,
        String path,
        String token,
        String body
    ) {
        MockHttpServletRequestBuilder request = request(method, path);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        if (body != null) {
            request.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        try {
            MvcResult result = mockMvc.perform(request).andReturn();
            HttpHeaders responseHeaders = new HttpHeaders();
            String location = result.getResponse().getHeader("Location");
            if (location != null) {
                responseHeaders.setLocation(URI.create(location));
            }
            return ResponseEntity
                .status(HttpStatus.valueOf(result.getResponse().getStatus()))
                .headers(responseHeaders)
                .body(result.getResponse().getContentAsString());
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo ejecutar MockMvc", exception);
        }
    }

    private String token(String role, Instant expiresAt) {
        JwtEncoder encoder = new NimbusJwtEncoder(
            new ImmutableJWKSet<>(new JWKSet(
                new RSAKey.Builder((RSAPublicKey) TEST_KEY_PAIR.getPublic())
                    .privateKey((RSAPrivateKey) TEST_KEY_PAIR.getPrivate())
                    .build()
            ))
        );
        Instant now = Instant.now();
        return encoder.encode(JwtEncoderParameters.from(
            org.springframework.security.oauth2.jwt.JwsHeader
                .with(SignatureAlgorithm.RS256)
                .build(),
            JwtClaimsSet.builder()
                .issuer("gaty-perry-auth")
                .subject("7")
                .audience(java.util.List.of("gaty-perry-api"))
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("rol", role)
                .build()
        )).getTokenValue();
    }

    private Atencion atencion(Long mascotaId) {
        Atencion atencion = new Atencion();
        atencion.setMascotaId(mascotaId);
        atencion.setFechaAtencion(
            java.time.LocalDateTime.of(2026, 10, 12, 10, 30)
        );
        atencion.setMotivo("Control");
        atencion.setDiagnostico("Buen estado");
        atencion.setProfesionalResponsable("Dra. Ejemplo");
        atencion.registrar(7L);
        return atencion;
    }

    private static KeyPair createKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static Path createPublicKeyFile() {
        try {
            Path file = Files.createTempFile("clinica-test-public-", ".pem");
            String encoded = Base64.getMimeEncoder(64, new byte[] {'\n'})
                .encodeToString(TEST_KEY_PAIR.getPublic().getEncoded());
            Files.writeString(
                file,
                "-----BEGIN PUBLIC KEY-----\n"
                    + encoded
                    + "\n-----END PUBLIC KEY-----\n"
            );
            file.toFile().deleteOnExit();
            return file;
        } catch (IOException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
