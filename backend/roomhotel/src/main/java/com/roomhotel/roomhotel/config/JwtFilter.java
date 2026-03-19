package com.roomhotel.roomhotel.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.roomhotel.roomhotel.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// JwtFilter intercepta cada solicitud entrante para verificar si incluye un token JWT válido.
// Si el token es válido, extrae el email, carga los detalles del usuario y establece
// la autenticación en el SecurityContext para que Spring Security reconozca al usuario.
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final String jwtSecret;

    // Constructor manual en lugar de @RequiredArgsConstructor porque necesitamos
    // combinar inyección por constructor (UserRepository) con @Value (jwtSecret).
    // Lombok no incluye campos anotados con @Value en el constructor generado,
    // lo que causa que jwtSecret llegue null en runtime y el token falle silenciosamente.
    public JwtFilter(UserRepository userRepository,
        @Value("${jwt.secret}") String jwtSecret) {
        this.userRepository = userRepository;
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // si no hay header o no empieza con "Bearer ", dejamos pasar sin autenticar.
        // los endpoints públicos (GET rooms, register, login) no necesitan token.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // sacamos el prefijo "Bearer " (7 caracteres) para quedarnos solo con el token
        final String token = authHeader.substring(7);
        final String email;

        try {
            // verifica firma + expiración y extrae el subject (email).
            // si el token fue alterado o expiró lanza JWTVerificationException.
            email = JWT.require(Algorithm.HMAC256(jwtSecret))
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            // token inválido o expirado — Spring Security rechazará el request
            // si el endpoint requiere autenticación
            filterChain.doFilter(request, response);
            return;
        }

        // solo cargamos el usuario si aún no hay autenticación en el contexto
        // para evitar trabajo innecesario en requests ya autenticados
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userRepository.findByEmail(email).orElse(null);

            if (userDetails != null) {
                // cargamos el usuario con sus permisos en el SecurityContext.
                // a partir de acá Spring Security sabe quién es el usuario
                // y qué puede hacer durante todo el procesamiento del request.
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}