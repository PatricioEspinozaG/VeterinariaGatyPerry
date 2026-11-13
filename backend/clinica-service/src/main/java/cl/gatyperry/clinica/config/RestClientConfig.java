package cl.gatyperry.clinica.config;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;

@Configuration
public class RestClientConfig {

    @Bean
    JdkClientHttpRequestFactory clinicaRequestFactory(
        @Value("${app.http.connect-timeout}") Duration connectTimeout,
        @Value("${app.http.read-timeout}") Duration readTimeout
    ) {
        HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(connectTimeout)
            .build();
        JdkClientHttpRequestFactory requestFactory =
            new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(readTimeout);
        return requestFactory;
    }
}
