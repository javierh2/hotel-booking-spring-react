package com.roomhotel.roomhotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "FEATURES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = true)
    private String icon;


    // lado inverso de la relación, Room es la tabla primaria
    // set y no list porque no importa el orden y para evitar duplicados
    @ManyToMany(mappedBy = "features")
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();
    
}
