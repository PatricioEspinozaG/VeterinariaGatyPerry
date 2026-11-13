package cl.gatyperry.clinica.config;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class JwtConfig {

    @Bean
    JwtDecoder jwtDecoder(
        @Value("${app.jwt.public-key}") Resource resource,
        @Value("${app.jwt.issuer}") String issuer
    ) throws Exception {
        RSAPublicKey publicKey = readPublicKey(resource);
        NimbusJwtDecoder decoder = NimbusJwtDecoder
            .withPublicKey(publicKey)
            .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(issuer),
            new JwtClaimValidator<List<String>>(
                JwtClaimNames.AUD,
                audience -> audience != null
                    && audience.contains("gaty-perry-api")
            ),
            new JwtClaimValidator<String>(
                JwtClaimNames.SUB,
                JwtConfig::isUserId
            )
        ));
        return decoder;
    }

    private static boolean isUserId(String subject) {
        if (subject == null) {
            return false;
        }
        try {
            return Long.parseLong(subject) > 0;
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    private RSAPublicKey readPublicKey(Resource resource) throws Exception {
        String pem;
        try (var input = resource.getInputStream()) {
            pem = new String(input.readAllBytes(), StandardCharsets.US_ASCII);
        }
        String base64 = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(base64);
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
            .generatePublic(new X509EncodedKeySpec(keyBytes));
    }
}
