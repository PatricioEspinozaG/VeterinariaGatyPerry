package cl.gatyperry.productos.productos.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TokenInternoService {

    private final String tokenEsperado;

    public TokenInternoService(
        @Value("${app.internal-token}") String tokenEsperado
    ) {
        this.tokenEsperado = tokenEsperado;
    }

    public void validar(String token) {
        if (token == null || !MessageDigest.isEqual(
            tokenEsperado.getBytes(StandardCharsets.UTF_8),
            token.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Autenticación de servicio inválida"
            );
        }
    }
}
