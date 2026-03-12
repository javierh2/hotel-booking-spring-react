package com.roomhotel.roomhotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


// configuración global de la aplicación
@Configuration
public class CorsConfig {


    // WebMvcConfigurer para personalizar el comportamiento de Spring MVC
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry
                        // configuración a todos los endpoints
                        .addMapping("/api/**")


                        // 5173 puerto de Vite (React moderno)
                        // 3000 puerto de Create React App (React clásico)
                        .allowedOrigins(
                                "http://localhost:5173",
                                "http://localhost:3000"
                        )

                        .allowedMethods("GET", "POST", "DELETE", "PUT", "OPTIONS")

                        // autentificación
                        .allowedHeaders("*")
                        // cookies y credenciales
                        .allowCredentials(true);
            }
        };
    }
}