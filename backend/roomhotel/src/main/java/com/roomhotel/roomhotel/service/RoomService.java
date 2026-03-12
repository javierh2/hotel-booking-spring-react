package com.roomhotel.roomhotel.service;

import com.roomhotel.roomhotel.dto.RoomRequestDTO;
import com.roomhotel.roomhotel.dto.RoomResponseDTO;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.exception.DuplicateNameException;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

// le dice a Spring que esta clase es un componente de lógica de negocio
@Service
public class RoomService {

    // inyeccion de dependencias
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }


    // listar productos
    public List<RoomResponseDTO> getAllRooms() {
        // findAll() trae TODAS las habitaciones de la DB
        // .stream() convierte la lista en un flujo para procesarla
        // .map() convierte cada Room → RoomResponseDTO
        // .collect() junta en una lista nueva
        return roomRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }


    // obtener habitación por ID, si está vacío, lanzá su excepción
    public RoomResponseDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Habitación no encontrada con id: " + id
                ));

        return convertToResponseDTO(room);
    }


    // listar habitaciones, aleatorias, sin repetir
    public List<RoomResponseDTO> getRandomRooms() {
        // Traemos todas las habitaciones
        List<Room> allRooms = roomRepository.findAll();

        // Collections.shuffle() las mezcla aleatoriamente
        Collections.shuffle(allRooms);

        // máximo 10 y evita errores si hay menos de 10 habitaciones
        return allRooms.subList(0, Math.min(10, allRooms.size()))
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }


    // registrar habitación
    @Transactional
    // @Transactional ,si funciona impacta en la DB, sino, hace rollback, evita datos incompletos en la DB
    public RoomResponseDTO createRoom(RoomRequestDTO requestDTO) {

        // validacion de nombre único para no repetir
        if (roomRepository.findByName(requestDTO.getName()).isPresent()) {
            throw new DuplicateNameException(
                    "Ya existe una habitación con el nombre: '"
                            + requestDTO.getName() + "'"
            );
        }


        // DTO que llegó del frontend se convierte en una entidad Room para guardarse y persistir en la DB
        Room newRoom = convertToEntity(requestDTO);


        // save() hace el INSERT en la DB
        // nos devuelve la Room ya guardada con el id generado
        Room savedRoom = roomRepository.save(newRoom);


        // Convertimos la entidad guardada en DTO de respuesta
        // para devolvérselo al frontend
        return convertToResponseDTO(savedRoom);
    }


    // elimina un registro de la DB mediante HardDelete
    @Transactional
    public void deleteRoom(Long id) {

        // verificacion de habitación existente
        roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Habitación no encontrada con id: " + id
                ));

        // Borra físicamente el registro de la DB
        roomRepository.deleteById(id);
    }


    // Convierte Room (entidad DB) a RoomResponseDTO (lo que ve el frontend)
    private RoomResponseDTO convertToResponseDTO(Room room) {
        return RoomResponseDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .category(room.getCategory())
                .price(room.getPrice())
                .imageRoom(room.getImageRoom())
                .active(room.getActive())
                .build();
    }


    // Convierte RoomRequestDTO (lo que manda el frontend) a Room (entidad DB)
    private Room convertToEntity(RoomRequestDTO dto) {
        return Room.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .imageRoom(dto.getImageRoom())
                .active(true) // toda habitación nueva arranca en "active" (disponible)
                .build();
    }
}