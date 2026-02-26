package com.roomhotel.roomhotel.entity;

import jakarta.persistence.*;
import jakarta.validation.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;


@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    @NotBlank(message = "el nombre es obligatorio")
    private String name;

    @Column(nullable = false,length = 1000)
    @NotBlank(message = "la informacion es necesaria")
    private String description;

    @Column(nullable = false)
    @NotBlank(message = "la categoria es obligatoria")
    private String category;

    @Column(nullable = false)
    @NotNull(message = "el precio es obligatiorio")
    @Positive(message = "el precio debe ser positivo")
    private Double price;

    @Column(nullable = false)
    @NotBlank(message = "la imagen es necesaria")
    private String imageRoom;

    @Column(nullable = false)
    private Boolean active = true;


}

