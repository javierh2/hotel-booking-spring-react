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
    private String imageRoom;
    private Boolean active;

    // lista de características de ROOM
    @Builder.Default
    private List<FeatureResponseDTO> features = List.of();
}
