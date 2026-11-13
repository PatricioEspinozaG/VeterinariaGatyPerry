package cl.gatyperry.common.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtSupportTests {
    @Test
    void validatesIssuerAndAudienceForEveryService() throws Exception {
        KeyPair pair = keyPair();
        var decoder = JwtSupport.decoder(
            (RSAPublicKey) pair.getPublic(), "gaty-perry-auth", false
        );
        assertEquals("7", decoder.decode(token(pair, "gaty-perry-auth", "gaty-perry-api", "7")).getSubject());
        assertThrows(JwtException.class, () -> decoder.decode(
            token(pair, "otro-emisor", "gaty-perry-api", "7")
        ));
        assertThrows(JwtException.class, () -> decoder.decode(
            token(pair, "gaty-perry-auth", "otra-audiencia", "7")
        ));
    }

    @Test
    void clinicRequiresPositiveNumericSubject() throws Exception {
        KeyPair pair = keyPair();
        var decoder = JwtSupport.decoder(
            (RSAPublicKey) pair.getPublic(), "gaty-perry-auth", true
        );
        assertEquals("7", decoder.decode(token(pair, "gaty-perry-auth", "gaty-perry-api", "7")).getSubject());
        assertThrows(JwtException.class, () -> decoder.decode(
            token(pair, "gaty-perry-auth", "gaty-perry-api", "no-numérico")
        ));
    }

    private KeyPair keyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        return generator.generateKeyPair();
    }

    private String token(KeyPair pair, String issuer, String audience, String subject) {
        var key = new RSAKey.Builder((RSAPublicKey) pair.getPublic())
            .privateKey((RSAPrivateKey) pair.getPrivate())
            .build();
        var encoder = new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
        Instant now = Instant.now();
        return encoder.encode(JwtEncoderParameters.from(
            JwsHeader.with(SignatureAlgorithm.RS256).build(),
            JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(subject)
                .audience(List.of(audience))
                .issuedAt(now)
                .expiresAt(now.plusSeconds(120))
                .build()
        )).getTokenValue();
    }
}
