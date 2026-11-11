package cl.gatyperry.pacientes.config;

import java.io.IOException;
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
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class JwtConfig {

    @Bean
    public JwtDecoder jwtDecoder(
        @Value("${app.jwt.public-key}") Resource resource,
        @Value("${app.jwt.issuer}") String issuer
    ) throws Exception {
        RSAPublicKey publicKey = leerClavePublica(resource);
        NimbusJwtDecoder decoder =
            NimbusJwtDecoder.withPublicKey(publicKey).build();

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(issuer),
            new JwtClaimValidator<List<String>>(
                JwtClaimNames.AUD,
                aud -> aud != null && aud.contains("gaty-perry-api")
            )
        ));

        return decoder;
    }

    private RSAPublicKey leerClavePublica(Resource resource)
        throws Exception {

        String texto;
        try (var entrada = resource.getInputStream()) {
            texto = new String(
                entrada.readAllBytes(), StandardCharsets.US_ASCII
            );
        }

        String base64 = texto
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s", "");

        byte[] bytes = Base64.getDecoder().decode(base64);
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
            .generatePublic(new X509EncodedKeySpec(bytes));
    }
}