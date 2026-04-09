package com.roomhotel.roomhotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "ROOMS")
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


    // muchos "rooms" pueden pertenecer a una "category", con una columna con clave foránea en la tabla ROOMS
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;

    @Column(nullable = false)
    @NotNull(message = "el precio es obligatiorio")
    @Positive(message = "el precio debe ser positivo")
    private Double price;

    @Column(nullable = true)
    private String imageRoom;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // crea una tabla intermedia para referenciar los 2 id´s, de room y de feature, Room es el dueño de la relación
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "room_features",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "feature_id")
    )
    @Builder.Default
    private Set<Feature> features = new HashSet<>();

}

