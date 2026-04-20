package com.roomhotel.roomhotel.service;

import com.roomhotel.roomhotel.dto.BookingRequestDTO;
import com.roomhotel.roomhotel.dto.BookingResponseDTO;
import com.roomhotel.roomhotel.entity.Booking;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.entity.User;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.BookingRepository;
import com.roomhotel.roomhotel.repository.RoomRepository;
import com.roomhotel.roomhotel.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    // devuelve todos los rangos de fechas ocupadas para una room específica
    // el frontend usa estos rangos para pintar los días en el calendario
    // no devuelve días individuales, sería ineficiente para reservas largas
    // el frontend calcula qué días caen dentro de cada rango
    public List<BookingResponseDTO> getOccupiedDatesByRoom(Long roomId) {
        return bookingRepository.findByRoomId(roomId)
                .stream()
                .map(booking -> BookingResponseDTO.builder()
                        .id(booking.getId())
                        .roomId(booking.getRoom().getId())
                        .checkIn(booking.getCheckIn())
                        .checkOut(booking.getCheckOut())
                        .build())
                .collect(Collectors.toList());
    }

    // crea una reserva para el usuario autenticado
    // valida: checkOut > checkIn, room existe, room disponible en ese rango
    @Transactional
    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO dto) {

        if (!dto.getCheckOut().isAfter(dto.getCheckIn())) {
            throw new IllegalArgumentException(
                    "La fecha de salida debe ser posterior a la fecha de entrada");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada"));

        // verificamos que la room esté disponible en el rango solicitado
        // reutilizamos la misma query que usa getAvailableRooms
        List<Long> occupiedIds = bookingRepository.findOccupiedRoomIds(
                dto.getCheckIn(), dto.getCheckOut());
        if (occupiedIds.contains(dto.getRoomId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La habitación no está disponible en las fechas seleccionadas");
        }

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .build();

        Booking saved = bookingRepository.save(booking);

        return BookingResponseDTO.builder()
                .id(saved.getId())
                .roomId(saved.getRoom().getId())
                .checkIn(saved.getCheckIn())
                .checkOut(saved.getCheckOut())
                .build();
    }

}