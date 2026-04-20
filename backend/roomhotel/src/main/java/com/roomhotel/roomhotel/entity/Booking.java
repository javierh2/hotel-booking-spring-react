package com.roomhotel.roomhotel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "BOOKINGS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // muchas reservas pueden pertenecer a una misma room
    // no se cargan los rooms completos a menos que la necesitemos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // muchas reservas pueden pertenecer a un mismo usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // LocalDate sin hora
    // checkIn es el primer día de estadía (inclusive)
    @Column(nullable = false)
    private LocalDate checkIn;

    // checkOut es el día de salida
    // el room queda libre a partir del checkOut
    @Column(nullable = false)
    private LocalDate checkOut;

    // timestamp automático de cuándo se creó la reserva
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}