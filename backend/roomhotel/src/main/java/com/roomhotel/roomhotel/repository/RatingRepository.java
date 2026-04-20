package com.roomhotel.roomhotel.repository;

import com.roomhotel.roomhotel.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    // todas las reseñas de una room, ordenadas por fecha descendente
    // así el frontend siempre muestra la más reciente primero
    List<Rating> findByRoomIdOrderByCreatedAtDesc(Long roomId);

    // busca si un usuario ya puntuó una room, para evitar duplicados
    // y para saber si mostrar el formulario o no en el frontend
    Optional<Rating> findByUserIdAndRoomId(Long userId, Long roomId);

    // promedio de estrellas para una room — query JPQL con AVG()
    // devuelve null si no hay reseñas, el service lo convierte a 0.0
    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.room.id = :roomId")
    Double findAverageStarsByRoomId(@Param("roomId") Long roomId);

    // cuenta total de reseñas para una room — para mostrar "8 valoraciones"
    Long countByRoomId(Long roomId);

    // elimina todas las reseñas de una room — necesario antes de borrar la room
    void deleteByRoomId(Long roomId);
}