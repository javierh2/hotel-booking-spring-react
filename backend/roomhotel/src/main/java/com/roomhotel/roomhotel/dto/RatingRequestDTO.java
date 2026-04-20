package com.roomhotel.roomhotel.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingRequestDTO {

    // @NotNull + @Min/@Max validan antes de llegar al service
    // si falla, GlobalExceptionHandler devuelve HTTP 400 automáticamente
    @NotNull(message = "La puntuación es obligatoria")
    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 5, message = "La puntuación máxima es 5")
    private Integer stars;

    // comentario opcional, el usuario puede puntuar sin escribir nada
    private String comment;
}