package cl.gatyperry.common.security;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

public final class JwtSupport {
    private static final String AUDIENCE = "gaty-perry-api";

    private JwtSupport() {
    }

    public static RSAPublicKey readPublicKey(Resource resource) throws Exception {
        String pem;
        try (var input = resource.getInputStream()) {
            pem = new String(input.readAllBytes(), StandardCharsets.US_ASCII);
        }
        String base64 = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s", "");
        byte[] bytes = Base64.getDecoder().decode(base64);
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
            .generatePublic(new X509EncodedKeySpec(bytes));
    }

    public static JwtDecoder decoder(
        Resource resource,
        String issuer,
        boolean requireNumericSubject
    ) throws Exception {
        return decoder(readPublicKey(resource), issuer, requireNumericSubject);
    }

    public static JwtDecoder decoder(
        RSAPublicKey publicKey,
        String issuer,
        boolean requireNumericSubject
    ) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
            .withPublicKey(publicKey)
            .build();
        var issuerValidator = JwtValidators.createDefaultWithIssuer(issuer);
        var audienceValidator = new JwtClaimValidator<List<String>>(
            JwtClaimNames.AUD,
            audience -> audience != null && audience.contains(AUDIENCE)
        );
        if (requireNumericSubject) {
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                issuerValidator,
                audienceValidator,
                new JwtClaimValidator<String>(
                    JwtClaimNames.SUB,
                    JwtSupport::isPositiveUserId
                )
            ));
        } else {
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                issuerValidator,
                audienceValidator
            ));
        }
        return decoder;
    }

    private static boolean isPositiveUserId(String subject) {
        if (subject == null) {
            return false;
        }
        try {
            return Long.parseLong(subject) > 0;
        } catch (NumberFormatException exception) {
            return false;
        }
    }
}
