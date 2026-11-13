package cl.gatyperry.pedidos.config;

import cl.gatyperry.common.security.JwtSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Configuration
public class JwtConfig {
    @Bean
    public JwtDecoder jwtDecoder(
        @Value("${app.jwt.public-key}") Resource resource,
        @Value("${app.jwt.issuer}") String issuer
    ) throws Exception {
        return JwtSupport.decoder(resource, issuer, false);
    }
}
