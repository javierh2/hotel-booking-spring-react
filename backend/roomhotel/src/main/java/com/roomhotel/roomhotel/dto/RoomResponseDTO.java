package com.roomhotel.roomhotel.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

// creacion de objetos de forma legible
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponseDTO {

    // campos que el frontend necesita ver

    private Long id;
    private String name;
    private String description;
    private String category;
    private Double price;
    private String imageRoom;
    private Boolean active;
}
