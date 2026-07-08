package com.expense.demo.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;

@Configuration


public class CorsConfig {
    @Value("${cors.allowed-origins}")
    private String allowedOriginsString;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
      System.out.println("Allowed Origins: " + allowedOriginsString);
   
        configuration.setAllowedOrigins(Arrays.asList(allowedOriginsString.split(",")));
        
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}