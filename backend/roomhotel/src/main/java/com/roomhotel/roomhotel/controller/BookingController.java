package com.roomhotel.roomhotel.controller;

import com.roomhotel.roomhotel.dto.BookingRequestDTO;
import com.roomhotel.roomhotel.dto.BookingResponseDTO;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.UserRepository;
import com.roomhotel.roomhotel.service.BookingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService,UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository= userRepository;
    }

    // GET /api/bookings/room/{roomId}/occupied-dates
    // público, cualquier visitante necesita ver disponibilidad sin estar logueado
    // devuelve lista de rangos {checkIn, checkOut} para que el frontend calcule qué
    // días individuales marcar como ocupados en el calendario
    @GetMapping("/room/{roomId}/occupied-dates")
    public ResponseEntity<List<BookingResponseDTO>> getOccupiedDates(
            @PathVariable Long roomId) {
        return ResponseEntity.ok(bookingService.getOccupiedDatesByRoom(roomId));
    }


    // GET /api/bookings/my-bookings — historial de reservas del usuario autenticado
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails){
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }




    // POST /api/bookings — crea una reserva
    // autenticado — cualquier usuario logueado puede reservar
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        BookingResponseDTO created = bookingService.createBooking(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // helper privado — mismo patrón que FavoriteController y RatingController
    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"))
                .getId();
    }

}