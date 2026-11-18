package cl.gatyperry.citas;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPairGenerator;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class CitasServiceApplicationTests {

    private static final Path PUBLIC_KEY_FILE = createPublicKeyFile();

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17");

    @Autowired
    JdbcTemplate jdbcTemplate;

    @DynamicPropertySource
    static void testProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("app.jwt.public-key", () -> PUBLIC_KEY_FILE.toUri().toString());
    }

    @Test
    void contextLoads() {
        // Confirma que Spring arrancó y que Flyway creó la tabla en PostgreSQL.
        assertEquals(0L, jdbcTemplate.queryForObject("SELECT COUNT(*) FROM citas", Long.class));
    }

    private static Path createPublicKeyFile() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            Path file = Files.createTempFile("citas-test-public-", ".pem");
            String body = Base64.getMimeEncoder(64, new byte[] {'\n'})
                .encodeToString(generator.generateKeyPair().getPublic().getEncoded());
            Files.writeString(file, "-----BEGIN PUBLIC KEY-----\n" + body
                + "\n-----END PUBLIC KEY-----\n");
            file.toFile().deleteOnExit();
            return file;
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo crear la clave JWT pública de prueba", exception);
        }
    }
}
