package cl.gatyperry.citas.citas.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MascotaClient {

    private final RestClient restClient;

    public MascotaClient(
        RestClient.Builder builder,
        @Value("${app.pacientes.base-url}") String baseUrl
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    // Cliente: pacientes-service usa el JWT para comprobar al dueño.
    public void verificarPropiedad(Long mascotaId, String token) {
        try {
            restClient.get()
                .uri("/api/v1/mascotas/{id}", mascotaId)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mascota no encontrada para este usuario"
            );
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "No se pudo autenticar ante pacientes-service"
            );
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo comprobar la mascota"
            );
        }
    }

    // Personal: consulta el dueño real y lo compara con el cliente elegido.
    public void verificarPropiedadParaPersonal(
        Long mascotaId,
        Long userId,
        String token
    ) {
        MascotaRemota mascota;

        try {
            mascota = restClient.get()
                .uri("/api/v1/mascotas/gestion/{id}", mascotaId)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .body(MascotaRemota.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mascota no encontrada"
            );
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "No se pudo autenticar ante pacientes-service"
            );
        } catch (HttpClientErrorException.Forbidden ex) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para consultar mascotas"
            );
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo comprobar la mascota"
            );
        }

        if (mascota == null
            || !Long.toString(userId).equals(mascota.userId())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "La mascota no pertenece al cliente indicado"
            );
        }
    }

    public record MascotaRemota(
        Long id,
        String userId,
        String nombre
    ) {
    }
}