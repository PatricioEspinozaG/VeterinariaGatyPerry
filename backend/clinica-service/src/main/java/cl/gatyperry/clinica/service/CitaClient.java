package cl.gatyperry.clinica.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CitaClient {

    private final RestClient restClient;

    public CitaClient(
        RestClient.Builder builder,
        ClientHttpRequestFactory requestFactory,
        @Value("${app.citas.base-url}") String baseUrl
    ) {
        restClient = builder
            .baseUrl(baseUrl)
            .requestFactory(requestFactory)
            .build();
    }

    public CitaRemota obtener(Long citaId, String token) {
        CitaRemota cita;
        try {
            cita = restClient.get()
                .uri("/api/v1/citas/gestion/{id}", citaId)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .body(CitaRemota.class);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cita no encontrada"
            );
        } catch (HttpClientErrorException.Forbidden exception) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para consultar la cita"
            );
        } catch (RestClientException exception) {
            throw new DependenciaRemotaException(
                "No se pudo verificar la cita en citas-service",
                exception
            );
        }

        if (cita == null || !citaId.equals(cita.id())
            || cita.mascotaId() == null || cita.userId() == null
            || cita.estado() == null) {
            throw new DependenciaRemotaException(
                "citas-service devolvió una respuesta inválida"
            );
        }
        return cita;
    }

    public record CitaRemota(
        Long id,
        Long userId,
        Long mascotaId,
        String estado
    ) {
    }
}
