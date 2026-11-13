package cl.gatyperry.clinica.config;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class IdentidadActual {

    public Long userId(Jwt jwt) {
        try {
            return Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException | NullPointerException exception) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "El subject del token no es válido"
            );
        }
    }

    public boolean isCliente(Jwt jwt) {
        return "CLIENTE".equals(jwt.getClaimAsString("rol"));
    }
}
