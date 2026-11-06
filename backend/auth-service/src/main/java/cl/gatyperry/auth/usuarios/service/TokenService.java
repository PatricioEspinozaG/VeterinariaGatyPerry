package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    public static final long DURACION_SEGUNDOS = 15 * 60;

    private final JwtEncoder encoder;
    private final String issuer;

    public TokenService(
        JwtEncoder encoder,
        @Value("${app.jwt.issuer}") String issuer
    ) {
        this.encoder = encoder;
        this.issuer = issuer;
    }

    public String crearToken(UsuarioResponse usuario) {
        Instant ahora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(issuer)
            .subject(usuario.id().toString())
            .audience(List.of("gaty-perry-api"))
            .issuedAt(ahora)
            .expiresAt(ahora.plusSeconds(DURACION_SEGUNDOS))
            .claim("rol", usuario.rol().name())
            .build();

        JwsHeader encabezado = JwsHeader
            .with(SignatureAlgorithm.RS256)
            .build();

        return encoder.encode(
            JwtEncoderParameters.from(encabezado, claims)
        ).getTokenValue();
    }
}