package com.roomhotel.roomhotel.controller;

import com.roomhotel.roomhotel.dto.RoomResponseDTO;
import com.roomhotel.roomhotel.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.roomhotel.roomhotel.repository.UserRepository;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    public FavoriteController(FavoriteService favoriteService,
                              UserRepository userRepository) {
        this.favoriteService = favoriteService;
        this.userRepository = userRepository;
    }

    // @AuthenticationPrincipal inyecta el UserDetails del token JWT
    // Spring Security lo extrae del SecurityContext — no necesitamos leer el token manualmente
    // así el userId viene del token verificado, no de un parámetro manipulable por el cliente

    // GET /api/favorites — lista las rooms favoritas del usuario logueado
    @GetMapping
    public ResponseEntity<List<RoomResponseDTO>> getFavorites(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(favoriteService.getFavoriteRooms(userId));
    }

    // GET /api/favorites/ids — solo los roomIds marcados como favoritos
    // más eficiente que traer los objetos completos cuando solo necesitamos
    // saber qué corazones pintar activos en el catálogo
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(favoriteService.getFavoriteRoomIds(userId));
    }

    // POST /api/favorites/{roomId} — agrega a favoritos
    @PostMapping("/{roomId}")
    public ResponseEntity<Void> addFavorite(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        favoriteService.addFavorite(userId, roomId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/favorites/{roomId} — quita de favoritos
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        favoriteService.removeFavorite(userId, roomId);
        return ResponseEntity.noContent().build();
    }

    // helper privado — traduce el email del UserDetails al userId de la DB
    // @AuthenticationPrincipal da el username (email), no el id
    // necesitamos el id para las queries de Favorite
    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"))
                .getId();
    }
}