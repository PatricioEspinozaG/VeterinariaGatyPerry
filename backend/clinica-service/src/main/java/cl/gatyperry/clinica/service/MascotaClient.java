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
public class MascotaClient {

    private final RestClient restClient;

    public MascotaClient(
        RestClient.Builder builder,
        ClientHttpRequestFactory requestFactory,
        @Value("${app.pacientes.base-url}") String baseUrl
    ) {
        restClient = builder
            .baseUrl(baseUrl)
            .requestFactory(requestFactory)
            .build();
    }

    public void verificarPropiedad(
        Long mascotaId,
        Long userId,
        String token
    ) {
        MascotaRemota mascota = obtener(
            "/api/v1/mascotas/{id}",
            mascotaId,
            token
        );
        verificarRespuesta(mascota, mascotaId);
        if (!Long.toString(userId).equals(mascota.userId())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mascota no encontrada para este usuario"
            );
        }
    }

    public MascotaRemota verificarParaPersonal(Long mascotaId, String token) {
        MascotaRemota mascota = obtener(
            "/api/v1/mascotas/gestion/{id}",
            mascotaId,
            token
        );
        verificarRespuesta(mascota, mascotaId);
        return mascota;
    }

    private MascotaRemota obtener(String ruta, Long mascotaId, String token) {
        try {
            return restClient.get()
                .uri(ruta, mascotaId)
                .headers(headers -> headers.setBearerAuth(token))
                .retrieve()
                .body(MascotaRemota.class);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mascota no encontrada para este usuario"
            );
        } catch (HttpClientErrorException.Forbidden exception) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para consultar la mascota"
            );
        } catch (RestClientException exception) {
            throw new DependenciaRemotaException(
                "No se pudo verificar la mascota en pacientes-service",
                exception
            );
        }
    }

    private void verificarRespuesta(MascotaRemota mascota, Long mascotaId) {
        if (mascota == null || !mascotaId.equals(mascota.id())
            || mascota.userId() == null || mascota.userId().isBlank()) {
            throw new DependenciaRemotaException(
                "pacientes-service devolvió una respuesta inválida"
            );
        }
    }

    public record MascotaRemota(Long id, String userId, String nombre) {
    }
}
