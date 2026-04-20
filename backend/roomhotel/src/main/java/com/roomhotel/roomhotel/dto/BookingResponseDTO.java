package com.roomhotel.roomhotel.dto;

import lombok.*;
import java.time.LocalDate;

// DTO de respuesta para reservas solo expone los campos que el frontend necesita
// no exponemos user ni datos internos (principio de mínima exposición)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private Long id;
    private Long roomId;

    // checkIn y checkOut como String ISO (YYYY-MM-DD) para que JSON los serialice sin timezone
    // LocalDate serializa directo como "2026-05-01" con Jackson; sin configuración extra
    private LocalDate checkIn;
    private LocalDate checkOut;
}