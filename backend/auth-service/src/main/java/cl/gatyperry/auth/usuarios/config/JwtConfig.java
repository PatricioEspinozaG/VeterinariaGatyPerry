package cl.gatyperry.auth.usuarios.config;

import cl.gatyperry.common.security.JwtSupport;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfig {
    @Bean
    public RSAPublicKey jwtPublicKey(
        @Value("${app.jwt.public-key}") Resource resource
    ) throws Exception {
        return JwtSupport.readPublicKey(resource);
    }

    @Bean
    public RSAPrivateKey jwtPrivateKey(
        @Value("${app.jwt.private-key}") Resource resource
    ) throws Exception {
        String pem;
        try (var input = resource.getInputStream()) {
            pem = new String(input.readAllBytes(), StandardCharsets.US_ASCII);
        }
        String base64 = pem
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replaceAll("\\s", "");
        byte[] bytes = Base64.getDecoder().decode(base64);
        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
            .generatePrivate(new PKCS8EncodedKeySpec(bytes));
    }

    @Bean
    public JwtEncoder jwtEncoder(
        RSAPublicKey publicKey,
        RSAPrivateKey privateKey
    ) {
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .build();
        return new NimbusJwtEncoder(
            new ImmutableJWKSet<>(new JWKSet(rsaKey))
        );
    }

    @Bean
    public JwtDecoder jwtDecoder(
        RSAPublicKey publicKey,
        @Value("${app.jwt.issuer}") String issuer
    ) {
        return JwtSupport.decoder(publicKey, issuer, false);
    }
}
