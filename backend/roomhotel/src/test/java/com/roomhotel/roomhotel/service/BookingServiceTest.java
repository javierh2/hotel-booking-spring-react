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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class) le dice a JUnit que use Mockito
// para crear los mocks anotados con @Mock e inyectarlos en @InjectMocks
// sin esto, los campos @Mock quedan null y el test explota con NullPointerException
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

        // @Mock crea una version falsa del repositorio — no toca ninguna DB real
        // Mockito intercepta todas las llamadas y devuelve lo que le programemos en cada test
        @Mock
        private BookingRepository bookingRepository;

        @Mock
        private RoomRepository roomRepository;

        @Mock
        private UserRepository userRepository;

        // EmailService también se mockea — los tests no envian emails reales
        @Mock
        private EmailService emailService;

        // @InjectMocks crea una instancia REAL de BookingService
        // e inyecta los @Mock de arriba en su constructor automáticamente
        // esto es lo que se testea: la lógica real del servicio
        @InjectMocks
        private BookingService bookingService;

        // objetos que reutilizamos en múltiples tests
        // se arman con @BeforeEach para que cada test arranque con datos limpios
        private User testUser;
        private Room testRoom;
        private BookingRequestDTO validDto;

        // @BeforeEach se ejecuta ANTES de cada @Test
        // garantiza que ningún test contamina el estado del siguiente
        @BeforeEach
        void setUp() {
                testUser = new User();
                testUser.setId(1L);
                testUser.setFirstName("Juan");
                testUser.setLastName("Perez");
                testUser.setEmail("juan@test.com");

                testRoom = new Room();
                testRoom.setId(10L);
                testRoom.setName("Suite Patagonica");
                testRoom.setPrice(150.0);

                // DTO válido que usamos como base en la mayoría de los tests
                // checkOut es posterior a checkIn — cumple la validación básica
                validDto = new BookingRequestDTO();
                validDto.setRoomId(10L);
                validDto.setCheckIn(LocalDate.of(2026, 6, 10));
                validDto.setCheckOut(LocalDate.of(2026, 6, 15));
        }

        // TEST 1
        @Test
        @DisplayName("createBooking: checkOut igual a checkIn debe lanzar IllegalArgumentException")
        void createBooking_checkOutEqualCheckIn_throwsIllegalArgument() {

                // Arrange — armamos el DTO con fechas inválidas
                BookingRequestDTO dto = new BookingRequestDTO();
                dto.setRoomId(10L);
                dto.setCheckIn(LocalDate.of(2026, 6, 10));
                // mismo día que checkIn — no cumple checkOut.isAfter(checkIn)
                dto.setCheckOut(LocalDate.of(2026, 6, 10));

                // Act + Assert — ejecutamos y verificamos que tira la excepción correcta
                // assertThrows captura la excepción y falla el test si NO se lanza
                IllegalArgumentException ex = assertThrows(
                                IllegalArgumentException.class,
                                // lambda que ejecuta el código que debería explotar
                                () -> bookingService.createBooking(1L, dto));

                // verificamos que el mensaje de la excepción es el correcto
                // esto garantiza que no estamos capturando otra excepción accidental
                assertEquals(
                                "La fecha de salida debe ser posterior a la fecha de entrada",
                                ex.getMessage());

                // verificamos que nunca se intentó guardar nada en la DB
                // si el service hubiera llamado a save() antes de validar, este verify fallaría
                // never() es la forma de Mockito de decir "este method nunca debería haberse
                // llamado"
                verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("createBooking: checkOut anterior a checkIn debe lanzar IllegalArgumentException")
        void createBooking_checkOutBeforeCheckIn_throwsIllegalArgument() {

                BookingRequestDTO dto = new BookingRequestDTO();
                dto.setRoomId(10L);
                dto.setCheckIn(LocalDate.of(2026, 6, 15));
                // checkOut es ANTES que checkIn — caso aún más claro
                dto.setCheckOut(LocalDate.of(2026, 6, 10));

                assertThrows(
                                IllegalArgumentException.class,
                                () -> bookingService.createBooking(1L, dto));

                verify(bookingRepository, never()).save(any());
        }


        // TEST 2
        @Test
        @DisplayName("createBooking: usuario inexistente debe lanzar ResourceNotFoundException")
        void createBooking_userNotFound_throwsResourceNotFoundException() {

                // when(...).thenReturn(...) es la forma de Mockito de programar el mock
                // "cuando alguien llame a findById(1L), devolvé Optional.empty()"
                // Optional.empty() simula que el usuario no existe en la DB
                when(userRepository.findById(1L)).thenReturn(Optional.empty());

                ResourceNotFoundException ex = assertThrows(
                                ResourceNotFoundException.class,
                                () -> bookingService.createBooking(1L, validDto));

                assertEquals("Usuario no encontrado", ex.getMessage());

                // si el usuario no existe, nunca deberíamos buscar la room
                // esto verifica que el service falla rápido (fail fast)
                verify(roomRepository, never()).findById(any());
                verify(bookingRepository, never()).save(any());
        }


        // TEST 3
        @Test
        @DisplayName("createBooking: room inexistente debe lanzar ResourceNotFoundException")
        void createBooking_roomNotFound_throwsResourceNotFoundException() {

                // el usuario SÍ existe
                when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
                // pero la room NO existe
                when(roomRepository.findById(10L)).thenReturn(Optional.empty());

                ResourceNotFoundException ex = assertThrows(
                                ResourceNotFoundException.class,
                                () -> bookingService.createBooking(1L, validDto));

                assertEquals("Habitación no encontrada", ex.getMessage());
                verify(bookingRepository, never()).save(any());
        }


        // TEST 4
        @Test
        @DisplayName("createBooking: room ocupada debe lanzar ResponseStatusException 409")
        void createBooking_roomOccupied_throwsConflict() {

                when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
                when(roomRepository.findById(10L)).thenReturn(Optional.of(testRoom));

                // findOccupiedRoomIds devuelve una lista que contiene el id de nuestra room
                // esto simula que ya existe una reserva que se superpone con las fechas pedidas
                // any() es un matcher de Mockito: "para cualquier LocalDate que le pasen"
                when(bookingRepository.findOccupiedRoomIds(any(), any()))
                                .thenReturn(List.of(10L));

                // ResponseStatusException envuelve el HTTP 409 — verificamos ambas cosas:
                // que es del tipo correcto Y que el status es CONFLICT
                ResponseStatusException ex = assertThrows(
                                ResponseStatusException.class,
                                () -> bookingService.createBooking(1L, validDto));

                // getStatusCode() devuelve el HttpStatus — verificamos que es 409
                assertEquals(409, ex.getStatusCode().value());
                verify(bookingRepository, never()).save(any());
        }


        // TEST 5
        @Test
        @DisplayName("createBooking: reserva válida debe retornar BookingResponseDTO con datos correctos")
        void createBooking_validData_returnsBookingResponseDTO() {

                // Arrange — todo existe y la room está disponible
                when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
                when(roomRepository.findById(10L)).thenReturn(Optional.of(testRoom));

                // lista vacía = no hay reservas que se superpongan = room disponible
                when(bookingRepository.findOccupiedRoomIds(any(), any()))
                                .thenReturn(List.of());

                // cuando se llame a save(), devolvemos un Booking con todos los datos completos
                // esto simula lo que haría JPA al persistir: asigna un id y devuelve la entidad
                Booking savedBooking = Booking.builder()
                                .id(99L)
                                .user(testUser)
                                .room(testRoom)
                                .checkIn(validDto.getCheckIn())
                                .checkOut(validDto.getCheckOut())
                                .build();

                // any(Booking.class) matchea cualquier Booking que se le pase a save()
                // — no nos importa el objeto exacto, nos importa que se llame con un Booking
                when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

                // Act — ejecutamos el método que estamos testeando
                BookingResponseDTO result = bookingService.createBooking(1L, validDto);

                // Assert — verificamos cada campo del DTO devuelto
                assertNotNull(result);
                assertEquals(99L, result.getId());
                assertEquals(10L, result.getRoomId());
                assertEquals("Suite Patagonica", result.getRoomName());
                assertEquals(validDto.getCheckIn(), result.getCheckIn());
                assertEquals(validDto.getCheckOut(), result.getCheckOut());
                assertEquals("Juan", result.getUserFirstName());
                assertEquals("Perez", result.getUserLastName());
                assertEquals("juan@test.com", result.getUserEmail());

                // verificamos que save() fue llamado exactamente UNA vez
                // times(1) es explícito — si se llama dos veces, el test falla
                verify(bookingRepository, times(1)).save(any(Booking.class));

                // verificamos que el email se intentó enviar
                // verify sin modificador = exactamente una vez (equivalente a times(1))
                verify(emailService).sendBookingConfirmation(
                                eq("juan@test.com"),
                                eq("Juan"),
                                eq("Suite Patagonica"),
                                eq(validDto.getCheckIn()),
                                eq(validDto.getCheckOut()));
        }


        // TEST 6
        @Test
        @DisplayName("createBooking: si el email falla, la reserva igual se retorna correctamente")
        void createBooking_emailFails_bookingStillReturned() {

                when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
                when(roomRepository.findById(10L)).thenReturn(Optional.of(testRoom));
                when(bookingRepository.findOccupiedRoomIds(any(), any())).thenReturn(List.of());

                Booking savedBooking = Booking.builder()
                                .id(99L)
                                .user(testUser)
                                .room(testRoom)
                                .checkIn(validDto.getCheckIn())
                                .checkOut(validDto.getCheckOut())
                                .build();

                when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

                // doThrow hace que el mock lance una excepción cuando se lo llamen
                // esto simula que Mailtrap está caído o la red falló
                // el test verifica que a pesar del fallo del email,
                // el service NO propaga la excepción y devuelve el DTO igual
                doThrow(new RuntimeException("Mailtrap caido"))
                                .when(emailService)
                                .sendBookingConfirmation(any(), any(), any(), any(), any());

                // no debe lanzar excepción — el try/catch del service lo absorbe
                BookingResponseDTO result = assertDoesNotThrow(
                                () -> bookingService.createBooking(1L, validDto));

                // la reserva igual se devuelve correctamente
                assertNotNull(result);
                assertEquals(99L, result.getId());

                // save() se llamó — la reserva está guardada
                verify(bookingRepository, times(1)).save(any(Booking.class));
        }
}