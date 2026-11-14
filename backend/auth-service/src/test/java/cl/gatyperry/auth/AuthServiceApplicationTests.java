package cl.gatyperry.auth;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class AuthServiceApplicationTests {

    private static final KeyPair TEST_KEYS = createKeyPair();
    private static final Path PUBLIC_KEY_FILE = writeKey(
        "auth-test-public-", "PUBLIC KEY", TEST_KEYS.getPublic().getEncoded()
    );
    private static final Path PRIVATE_KEY_FILE = writeKey(
        "auth-test-private-", "PRIVATE KEY", TEST_KEYS.getPrivate().getEncoded()
    );

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17");

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    MockMvc mockMvc;

    @DynamicPropertySource
    static void testProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("app.jwt.public-key", () -> PUBLIC_KEY_FILE.toUri().toString());
        registry.add("app.jwt.private-key", () -> PRIVATE_KEY_FILE.toUri().toString());
    }

    @Test
    void contextLoads() throws Exception {
        // Arranca el contexto con Flyway y una BD temporal, sin usar las credenciales locales.
        assertEquals(0L, jdbcTemplate.queryForObject("SELECT COUNT(*) FROM usuarios", Long.class));
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("/api/v1/auth/login")))
            .andExpect(content().string(containsString("bearer-jwt")));
    }

    private static KeyPair createKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudieron crear las claves JWT de prueba", exception);
        }
    }

    private static Path writeKey(String prefix, String label, byte[] encoded) {
        try {
            Path file = Files.createTempFile(prefix, ".pem");
            String body = Base64.getMimeEncoder(64, new byte[] {'\n'}).encodeToString(encoded);
            Files.writeString(file, "-----BEGIN " + label + "-----\n" + body
                + "\n-----END " + label + "-----\n");
            file.toFile().deleteOnExit();
            return file;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo crear el PEM de prueba", exception);
        }
    }
}
