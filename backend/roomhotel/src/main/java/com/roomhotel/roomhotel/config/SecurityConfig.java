package com.roomhotel.roomhotel.config;

import com.roomhotel.roomhotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Inyectamos nuestro filtro personalizado de JWT y el repositorio de usuarios
    private final JwtFilter jwtFilter;
    private final UserRepository userRepository;

    // UserDetailsService — Spring Security llama a este bean cuando necesita
    // cargar un usuario por su username (email).
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con email: " + email));
    }

    // BCryptPasswordEncoder — el algoritmo estándar para hashear contraseñas.
    // El número 10 es número de rondas de hashing.
    // balance estándar para producción.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    // DaoAuthenticationProvider conecta UserDetailsService con PasswordEncoder.
    // ejecuta el proceso de: buscar usuario → comparar contraseña hasheada.
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // AuthenticationManager — el componente central que Spring Security usa para
    // autenticar usuarios
    // expuesto como bean para poder inyectarlo en nuestro AuthService.
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // SecurityFilterChain define la configuración de seguridad HTTP
    // config de que endpoints son públicos, cuáles requieren autenticación y qué
    // roles se necesitan.
    // registro del filtro JWT para que se ejecute antes del filtro de autenticación
    // estándar de Spring Security.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // públicos sin token

                        .requestMatchers("/api/auth/**").permitAll()
                        // rooms — más específico ANTES que el wildcard

                        .requestMatchers(HttpMethod.GET, "/api/rooms/available").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/random").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                        // features y categories

                        .requestMatchers(HttpMethod.GET, "/api/features/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        // bookings — occupied-dates público, POST autenticado

                        .requestMatchers(HttpMethod.GET, "/api/bookings/room/*/occupied-dates").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/bookings").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/bookings/my").authenticated()

                        // ratings — can-rate ANTES que el wildcard GET público
                        .requestMatchers(HttpMethod.GET, "/api/ratings/room/*/can-rate").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/ratings/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/ratings/**").authenticated()

                        // favoritos — todos autenticados

                        .requestMatchers("/api/favorites/**").authenticated()

                        // admin — ROLE_ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/rooms").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/features").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/features/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN")

                        .anyRequest().authenticated())

                // registro del filtro JWT para que se ejecute antes del filtro de autenticación
                // estándar de Spring Security.
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build(); // construye la cadena de filtros de seguridad con la configuración definida
    }

    // CORS centralizado — reemplaza los @CrossOrigin en cada controller
    // allowedOriginPatterns en lugar de allowedOrigins para soportar credenciales
    // el patrón *.vercel.app cubre cualquier URL de preview que Vercel genere
    // localhost:5173 se mantiene para desarrollo local sin cambiar nada
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // orígenes permitidos — localhost para desarrollo, Vercel para producción
        // usamos setAllowedOriginPatterns en lugar de setAllowedOrigins porque
        // allowedOrigins no es compatible con allowCredentials(true)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "https://*.vercel.app"));

        // métodos HTTP permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // headers que el frontend puede enviar — Authorization es crítico para JWT
        config.setAllowedHeaders(List.of("*"));

        // permite que el browser envíe cookies y el header Authorization
        config.setAllowCredentials(true);

        // aplica esta configuración a todos los endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}