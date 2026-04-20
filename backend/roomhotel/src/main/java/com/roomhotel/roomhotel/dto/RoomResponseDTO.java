package com.roomhotel.roomhotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// creacion de objetos de forma legible
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponseDTO {

    // campos que el frontend necesita ver
    private Long id;
    private String name;
    private String description;
    private CategoryResponseDTO category;
    private Double price;

    @Builder.Default
    private List<String> images = List.of();

    private Boolean active;

    // lista de características de ROOM
    @Builder.Default
    private List<FeatureResponseDTO> features = List.of();

    // promedio de estrellas calculado on-the-fly en RoomService.convertToResponseDTO()
    // null si la room no tiene reseñas aún, el frontend lo trata con una guarda
    private Double averageRating;

    // total de reseñas, para mostrar "8 valoraciones" junto al promedio
    @Builder.Default
    private Integer totalRatings = 0;
}