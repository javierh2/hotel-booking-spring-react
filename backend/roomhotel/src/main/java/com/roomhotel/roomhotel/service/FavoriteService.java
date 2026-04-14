package com.roomhotel.roomhotel.service;

import com.roomhotel.roomhotel.dto.RoomResponseDTO;
import com.roomhotel.roomhotel.entity.Favorite;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.entity.User;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.FavoriteRepository;
import com.roomhotel.roomhotel.repository.RoomRepository;
import com.roomhotel.roomhotel.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    // reutilizo RoomService para convertir Room en RoomResponseDTO
    // en lugar de duplicar la lógica de conversión
    private final RoomService roomService;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           RoomRepository roomRepository,
                           UserRepository userRepository,
                           RoomService roomService) {
        this.favoriteRepository = favoriteRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomService = roomService;
    }

    // agrega una room a favoritos del usuario autenticado
    // si ya existe (violación de uniqueConstraint) Spring lanza DataIntegrityViolationException
    // el GlobalExceptionHandler la convierte en 409 — el frontend la ignora silenciosamente
    @Transactional
    public void addFavorite(Long userId, Long roomId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .room(room)
                .build();

        favoriteRepository.save(favorite);
    }

    // elimina un favorito — si no existe, lanza 404
    // uso de findByUserIdAndRoomId para que un usuario solo pueda
    // eliminar SUS favoritos, nunca los de otro usuario
    @Transactional
    public void removeFavorite(Long userId, Long roomId) {
        Favorite favorite = favoriteRepository.findByUserIdAndRoomId(userId, roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorito no encontrado"));
        favoriteRepository.delete(favorite);
    }

    // lista los rooms favoritas del usuario como RoomResponseDTO
    // reutilizacion de getRoomById de RoomService para no duplicar la conversión
    public List<RoomResponseDTO> getFavoriteRooms(Long userId) {
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(fav -> roomService.getRoomById(fav.getRoom().getId()))
                .collect(Collectors.toList());
    }

    // devuelve solo los roomIds favoritos del usuario — usado por el frontend
    // para inicializar qué corazones están activos al cargar la página
    public List<Long> getFavoriteRoomIds(Long userId) {
        return favoriteRepository.findRoomIdsByUserId(userId);
    }
}