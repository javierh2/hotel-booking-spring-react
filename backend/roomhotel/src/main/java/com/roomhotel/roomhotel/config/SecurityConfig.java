package com.roomhotel.roomhotel.config;

import com.roomhotel.roomhotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
                        "Usuario no encontrado con email: " + email
                ));
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

    // AuthenticationManager — el componente central que Spring Security usa para autenticar usuarios
    // expuesto como bean para poder inyectarlo en nuestro AuthService.
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }


    // SecurityFilterChain define la configuración de seguridad HTTP
    // config de que endpoints son públicos, cuáles requieren autenticación y qué roles se necesitan.
    // registro del filtro JWT para que se ejecute antes del filtro de autenticación estándar de Spring Security.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF no aplica en APIs REST sin cookies de sesión
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // puede utilizarse sin token
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // las habitaciones pueden ser vistas por cualquier usuario, incluso sin autenticación (para el catálogo público)
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/random").permitAll()
                        .requestMatchers(HttpMethod.GET, "api/features/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                        // POST y DELETE de rooms requieren ser ADMIN
                        // hasRole() agrega el prefijo ROLE_ automáticamente
                        .requestMatchers(HttpMethod.POST, "/api/rooms").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/features").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/features/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN")

                        // Cualquier otro endpoint requiere estar autenticado
                        .anyRequest().authenticated()
                )
                // Desactivamos el frameOptions para que la consola H2 funcione en el browser
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                // registro del filtro JWT para que se ejecute antes del filtro de autenticación estándar de Spring Security.
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build(); // construye la cadena de filtros de seguridad con la configuración definida
    }
}