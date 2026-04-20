package com.roomhotel.roomhotel.repository;

import com.roomhotel.roomhotel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // busca los IDs de rooms que tienen al menos una reserva que se superpone con el rango checkIn-checkOut recibido.
    // la lógica de superposición: dos rangos [A,B) y [C,D) se superponen si A < D AND B > C
    // una reserva existente ocupa el rango si:
    //   b.checkIn  < :checkOut  (la reserva empieza ANTES de que el nuevo huésped se vaya)
    //   b.checkOut > :checkIn   (la reserva termina DESPUÉS de que el nuevo huésped llega)
    // si ambas condiciones se cumplen, la room está ocupada en ese período
    @Query("SELECT b.room.id FROM Booking b " +
            "WHERE b.checkIn < :checkOut AND b.checkOut > :checkIn")
    List<Long> findOccupiedRoomIds(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    // trae todas las reservas de un usuario
    List<Booking> findByUserId(Long userId);

    // trae todas las reservas de una room
    List<Booking> findByRoomId(Long roomId);

    // elimina todas las reservas de una room, necesario antes de borrar la room
    void deleteByRoomId(Long roomId);
}