package com.roomhotel.roomhotel.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingResponseDTO {

    private Long id;
    // nombre del usuario que hizo la reseña
    private String userName;
    private Integer stars;
    // comentario puede ser null — el frontend lo maneja con una guarda
    private String comment;
    // fecha de publicación
    private LocalDateTime createdAt;
}