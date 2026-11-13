package cl.gatyperry.clinica.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtConfigTests {

    private KeyPair keyPair;
    private JwtConfig config;

    @BeforeEach
    void preparar() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        keyPair = generator.generateKeyPair();
        config = new JwtConfig();
    }

    @Test
    void validaFirmaIssuerAudienciaYExpiracion() throws Exception {
        var decoder = config.jwtDecoder(publicKeyResource(keyPair), ISSUER);
        String valido = token(keyPair, ISSUER, AUDIENCE, Instant.now().plusSeconds(60));

        assertEquals("7", decoder.decode(valido).getSubject());
        assertThrows(
            JwtException.class,
            () -> decoder.decode(token(
                keyPair,
                "otro-issuer",
                AUDIENCE,
                Instant.now().plusSeconds(60)
            ))
        );
        assertThrows(
            JwtException.class,
            () -> decoder.decode(token(
                keyPair,
                ISSUER,
                List.of("otra-audiencia"),
                Instant.now().plusSeconds(60)
            ))
        );
        assertThrows(
            JwtException.class,
            () -> decoder.decode(token(
                keyPair,
                ISSUER,
                AUDIENCE,
                Instant.now().minusSeconds(60)
            ))
        );

        KeyPair otraClave = newKeyPair();
        assertThrows(
            JwtException.class,
            () -> decoder.decode(token(
                otraClave,
                ISSUER,
                AUDIENCE,
                Instant.now().plusSeconds(60)
            ))
        );
    }

    @Test
    void convierteClaimRolEnAutoridadRole() {
        Instant ahora = Instant.now();
        Jwt jwt = Jwt.withTokenValue("token")
            .header("alg", "RS256")
            .subject("7")
            .issuedAt(ahora)
            .expiresAt(ahora.plusSeconds(60))
            .claim("rol", "ADMIN")
            .build();

        var autenticacion = new SecurityConfig()
            .jwtAuthenticationConverter()
            .convert(jwt);

        assertTrue(autenticacion.getAuthorities()
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private static final String ISSUER = "gaty-perry-auth";
    private static final List<String> AUDIENCE = List.of("gaty-perry-api");

    private ByteArrayResource publicKeyResource(KeyPair pair) {
        String encoded = Base64.getMimeEncoder(64, new byte[] {'\n'})
            .encodeToString(pair.getPublic().getEncoded());
        String pem = "-----BEGIN PUBLIC KEY-----\n"
            + encoded
            + "\n-----END PUBLIC KEY-----";
        return new ByteArrayResource(pem.getBytes(StandardCharsets.US_ASCII));
    }

    private String token(
        KeyPair signingKey,
        String issuer,
        List<String> audience,
        Instant expiration
    ) {
        JwtEncoder encoder = new NimbusJwtEncoder(
            new ImmutableJWKSet<>(new JWKSet(
                new RSAKey.Builder((RSAPublicKey) signingKey.getPublic())
                    .privateKey((RSAPrivateKey) signingKey.getPrivate())
                    .build()
            ))
        );
        Instant issuedAt = expiration.isBefore(Instant.now())
            ? expiration.minusSeconds(60)
            : Instant.now();
        return encoder.encode(JwtEncoderParameters.from(
            org.springframework.security.oauth2.jwt.JwsHeader
                .with(SignatureAlgorithm.RS256)
                .build(),
            JwtClaimsSet.builder()
                .issuer(issuer)
                .subject("7")
                .audience(audience)
                .issuedAt(issuedAt)
                .expiresAt(expiration)
                .claim("rol", "ADMIN")
                .build()
        )).getTokenValue();
    }

    private KeyPair newKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
