package com.roomhotel.roomhotel.repository;

import com.roomhotel.roomhotel.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // trae todos los favoritos de un usuario para la página de favoritos
    List<Favorite> findByUserId(Long userId);

    // busca un favorito específico para saber si ya está marcado y para eliminarlo
    Optional<Favorite> findByUserIdAndRoomId(Long userId, Long roomId);

    // trae solo los roomIds favoritos de un usuario, más eficiente que traer
    // los objetos completos para inicializar el Set de favoritos en el frontend
    // la query JPQL extrae solo el campo room.id sin cargar Room completo
    @org.springframework.data.jpa.repository.Query(
            "SELECT f.room.id FROM Favorite f WHERE f.user.id = :userId"
    )
    List<Long> findRoomIdsByUserId(Long userId);
}