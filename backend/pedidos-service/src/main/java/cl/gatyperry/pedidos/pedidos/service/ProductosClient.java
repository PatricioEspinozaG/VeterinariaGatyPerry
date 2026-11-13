package cl.gatyperry.pedidos.pedidos.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductosClient {

    private final RestClient restClient;
    private final String internalToken;

    public ProductosClient(
        RestClient.Builder builder,
        @Value("${app.productos.base-url}") String baseUrl,
        @Value("${app.productos.internal-token}") String internalToken
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.internalToken = internalToken;
    }

    public List<ProductoReservado> reservar(
        String orderId,
        List<LineaReserva> items
    ) {
        try {
            List<ProductoReservado> response = restClient.post()
                .uri("/api/v1/productos/interno/reservas")
                .header("X-Internal-Token", internalToken)
                .body(new ReservaRequest(orderId, items))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
            if (response == null || response.isEmpty()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "productos-service devolvió una reserva vacía"
                );
            }
            return response;
        } catch (HttpClientErrorException ex) {
            throw new ResponseStatusException(
                ex.getStatusCode(),
                "productos-service rechazó la reserva de stock"
            );
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo reservar stock en productos-service"
            );
        }
    }

    public void confirmar(String orderId) {
        postSinRespuesta(
            "/api/v1/productos/interno/reservas/{orderId}/confirmar",
            orderId
        );
    }

    public void liberar(String orderId) {
        postSinRespuesta(
            "/api/v1/productos/interno/reservas/{orderId}/liberar",
            orderId
        );
    }

    private void postSinRespuesta(String uri, String orderId) {
        try {
            restClient.post()
                .uri(uri, orderId)
                .header("X-Internal-Token", internalToken)
                .retrieve()
                .toBodilessEntity();
        } catch (HttpClientErrorException ex) {
            throw new ResponseStatusException(
                ex.getStatusCode(),
                "productos-service no pudo actualizar la reserva"
            );
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo actualizar la reserva en productos-service"
            );
        }
    }

    public record LineaReserva(String code, Integer quantity) {
    }

    public record ReservaRequest(
        String orderId,
        List<LineaReserva> items
    ) {
    }

    public record ProductoReservado(
        String code,
        String name,
        Integer quantity,
        Long unitPrice
    ) {
    }
}
