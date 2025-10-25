package com.collabflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Your frontend origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // ✅ Allow sending cookies (required for refresh token)
        config.setAllowCredentials(true);

        // ✅ Allowed methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ✅ Allowed headers
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // ✅ Expose headers (optional but can help debugging)
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
