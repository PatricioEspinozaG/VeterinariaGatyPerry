package cl.gatyperry.auth.usuarios.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfig {

    @Bean
    public RSAPublicKey jwtPublicKey(
        @Value("${app.jwt.public-key}") Resource resource
    ) throws Exception {
        byte[] bytes = leerPem(resource, "PUBLIC KEY");
        PublicKey key = KeyFactory.getInstance("RSA")
            .generatePublic(new X509EncodedKeySpec(bytes));
        return (RSAPublicKey) key;
    }

    @Bean
    public RSAPrivateKey jwtPrivateKey(
        @Value("${app.jwt.private-key}") Resource resource
    ) throws Exception {
        byte[] bytes = leerPem(resource, "PRIVATE KEY");
        PrivateKey key = KeyFactory.getInstance("RSA")
            .generatePrivate(new PKCS8EncodedKeySpec(bytes));
        return (RSAPrivateKey) key;
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
        NimbusJwtDecoder decoder =
            NimbusJwtDecoder.withPublicKey(publicKey).build();
        decoder.setJwtValidator(
            JwtValidators.createDefaultWithIssuer(issuer)
        );
        return decoder;
    }

    private byte[] leerPem(Resource resource, String tipo)
        throws IOException {

        String texto;
        try (var entrada = resource.getInputStream()) {
            texto = new String(
                entrada.readAllBytes(), StandardCharsets.US_ASCII
            );
        }

        String contenido = texto
            .replace("-----BEGIN " + tipo + "-----", "")
            .replace("-----END " + tipo + "-----", "")
            .replaceAll("\\s", "");

        return Base64.getDecoder().decode(contenido);
    }
}