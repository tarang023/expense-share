package com.expense.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. Allow your specific Frontend URL
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        
        // 2. Allow specific methods (OPTIONS is crucial!)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 3. Allow Headers (Authorization is vital for JWT)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // 4. Allow Credentials (optional, but good for future-proofing)
        configuration.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}