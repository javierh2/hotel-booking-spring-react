package com.roomhotel.roomhotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "RATINGS",
        // un usuario solo puede puntuar una room una vez
        // si intenta de nuevo, el backend devuelve 409
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "room_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // estrellas entre 1 y 5 — validado a nivel entidad y DTO
    @Column(nullable = false)
    @Min(1)
    @Max(5)
    private Integer stars;

    // comentario opcional — puede ser null si el usuario solo quiere puntuar
    @Column(length = 1000)
    private String comment;

    // timestamp de creación — inmutable después de persistirse
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}