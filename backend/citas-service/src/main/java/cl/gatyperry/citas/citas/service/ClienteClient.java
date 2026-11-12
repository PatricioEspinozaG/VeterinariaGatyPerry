package cl.gatyperry.citas.citas.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClienteClient {

    private final RestClient restClient;

    public ClienteClient(
        RestClient.Builder builder,
        @Value("${app.auth.base-url}") String baseUrl
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public void verificarClienteActivo(Long userId, String token) {
        try {
            restClient.get()
                .uri("/api/v1/auth/gestion/clientes/{id}", userId)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cliente activo no encontrado"
            );
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "No se pudo autenticar ante auth-service"
            );
        } catch (HttpClientErrorException.Forbidden ex) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para consultar clientes"
            );
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo comprobar el cliente"
            );
        }
    }
}