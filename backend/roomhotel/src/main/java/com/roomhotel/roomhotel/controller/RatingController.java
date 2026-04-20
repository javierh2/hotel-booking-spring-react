package com.roomhotel.roomhotel.controller;

import com.roomhotel.roomhotel.dto.RatingRequestDTO;
import com.roomhotel.roomhotel.dto.RatingResponseDTO;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.UserRepository;
import com.roomhotel.roomhotel.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:5173")
public class RatingController {

    private final RatingService ratingService;
    private final UserRepository userRepository;

    public RatingController(RatingService ratingService, UserRepository userRepository) {
        this.ratingService = ratingService;
        this.userRepository = userRepository;
    }

    // GET /api/ratings/room/{roomId} — todas las reseñas de una room
    // público, cualquier visitante puede leer las reseñas sin estar logueado
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<RatingResponseDTO>> getRatings(@PathVariable Long roomId) {
        return ResponseEntity.ok(ratingService.getRatingsByRoom(roomId));
    }

    // GET /api/ratings/room/{roomId}/can-rate — ¿puede el usuario autenticado puntuar?
    // autenticado, solo tiene sentido consultarlo si hay un usuario logueado
    @GetMapping("/room/{roomId}/can-rate")
    public ResponseEntity<Map<String, Boolean>> canRate(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        boolean can = ratingService.canUserRate(userId, roomId);
        // Map.of() devuelve un JSON simple: {"canRate": true}
        return ResponseEntity.ok(Map.of("canRate", can));
    }

    // POST /api/ratings/room/{roomId} — crea una reseña
    // autenticado, verificamos además que tenga reserva finalizada en el service
    @PostMapping("/room/{roomId}")
    public ResponseEntity<RatingResponseDTO> createRating(
            @PathVariable Long roomId,
            @Valid @RequestBody RatingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        RatingResponseDTO created = ratingService.createRating(userId, roomId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // helper privado — mismo patrón que FavoriteController
    // traduce el email del token JWT al userId de la DB
    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"))
                .getId();
    }
}