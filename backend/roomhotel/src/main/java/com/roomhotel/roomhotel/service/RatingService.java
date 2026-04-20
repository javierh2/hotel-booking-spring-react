package com.roomhotel.roomhotel.service;

import com.roomhotel.roomhotel.dto.RatingRequestDTO;
import com.roomhotel.roomhotel.dto.RatingResponseDTO;
import com.roomhotel.roomhotel.entity.Rating;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.entity.User;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.BookingRepository;
import com.roomhotel.roomhotel.repository.RatingRepository;
import com.roomhotel.roomhotel.repository.RoomRepository;
import com.roomhotel.roomhotel.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    // BookingRepository para verificar que el usuario haya completado una reserva antes de permitirle puntuar
    private final BookingRepository bookingRepository;

    public RatingService(RatingRepository ratingRepository,
                         RoomRepository roomRepository,
                         UserRepository userRepository,
                         BookingRepository bookingRepository) {
        this.ratingRepository = ratingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    // crea una nueva reseña — solo si el usuario tiene una reserva finalizada
    @Transactional
    public RatingResponseDTO createRating(Long userId, Long roomId, RatingRequestDTO dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada"));

        // verifica que el usuario tenga al menos una reserva finalizada para esta room
        // "finalizada" = checkOut anterior a hoy
        // si no tiene reserva finalizada, no puede puntuar — 403 Forbidden
        boolean hasCompletedBooking = bookingRepository.findByRoomId(roomId)
                .stream()
                .anyMatch(b -> b.getUser().getId().equals(userId)
                        && b.getCheckOut().isBefore(LocalDate.now()));

        if (!hasCompletedBooking) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo podés puntuar habitaciones en las que te hospedaste"
            );
        }

        // si ya puntuó esta room, la unicidad de la tabla lo rechaza con 409
        // pero verificamos antes para dar un mensaje más claro
        if (ratingRepository.findByUserIdAndRoomId(userId, roomId).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya puntuaste esta habitación"
            );
        }

        Rating rating = Rating.builder()
                .user(user)
                .room(room)
                .stars(dto.getStars())
                .comment(dto.getComment())
                .build();

        Rating saved = ratingRepository.save(rating);
        return convertToDTO(saved);
    }

    // trae todas las reseñas de una room — endpoint público
    public List<RatingResponseDTO> getRatingsByRoom(Long roomId) {
        return ratingRepository.findByRoomIdOrderByCreatedAtDesc(roomId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // informa si el usuario ya puntuó esta room para que el frontend
    // muestre el formulario o un mensaje de "ya puntuaste"
    public boolean hasUserRated(Long userId, Long roomId) {
        return ratingRepository.findByUserIdAndRoomId(userId, roomId).isPresent();
    }

    // informa si el usuario puede puntuar, tiene reserva finalizada Y no puntuó aún
    // el frontend usa esto para decidir si muestra el formulario
    public boolean canUserRate(Long userId, Long roomId) {
        boolean hasCompleted = bookingRepository.findByRoomId(roomId)
                .stream()
                .anyMatch(b -> b.getUser().getId().equals(userId)
                        && b.getCheckOut().isBefore(LocalDate.now()));
        boolean alreadyRated = ratingRepository.findByUserIdAndRoomId(userId, roomId).isPresent();
        return hasCompleted && !alreadyRated;
    }

    // convierte Rating entidad a DTO — método privado reutilizable
    private RatingResponseDTO convertToDTO(Rating rating) {
        return RatingResponseDTO.builder()
                .id(rating.getId())
                .userName(rating.getUser().getFirstName() + " " + rating.getUser().getLastName())
                .stars(rating.getStars())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}