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

    // ── INYECCIÓN DE DEPENDENCIAS ──
    // Le pedimos a Spring que nos dé el RoomRepository
    // Usamos inyección por constructor porque es la mejor práctica:
    //   → hace el código más fácil de testear
    //   → deja claro qué dependencias necesita la clase
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // ════════════════════════════════════════════
    // OBTENER TODAS LAS HABITACIONES
    // Historia de Usuario #10: listar productos en el admin
    // ════════════════════════════════════════════
    public List<RoomResponseDTO> getAllRooms() {
        // findAll() trae TODAS las habitaciones de la DB
        // .stream() convierte la lista en un flujo para procesarla
        // .map() convierte cada Room → RoomResponseDTO
        // .collect() junta todo en una lista nueva
        return roomRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════
    // OBTENER UNA HABITACIÓN POR ID
    // Historia de Usuario #5: ver detalle de producto
    // ════════════════════════════════════════════
    public RoomResponseDTO getRoomById(Long id) {
        // findById devuelve un Optional<Room>
        // Optional = puede tener un valor o puede estar vacío
        // orElseThrow = si está vacío, lanzá esta excepción
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Habitación no encontrada con id: " + id
                ));

        return convertToResponseDTO(room);
    }

    // ════════════════════════════════════════════
    // OBTENER HABITACIONES ALEATORIAS PARA EL HOME
    // Historia de Usuario #4: máximo 10, aleatorios, sin repetir
    // ════════════════════════════════════════════
    public List<RoomResponseDTO> getRandomRooms() {
        // Traemos todas las habitaciones
        List<Room> allRooms = roomRepository.findAll();

        // Collections.shuffle() las mezcla aleatoriamente
        // Esto garantiza que cada vez que cargue el Home
        // las habitaciones aparezcan en orden diferente (HU #4)
        Collections.shuffle(allRooms);

        // subList(0, Math.min(10, size)) toma máximo 10
        // Math.min evita errores si hay menos de 10 habitaciones
        return allRooms.subList(0, Math.min(10, allRooms.size()))
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════
    // CREAR UNA HABITACIÓN NUEVA
    // Historia de Usuario #3: registrar producto
    // ════════════════════════════════════════════
    @Transactional
    // @Transactional significa:
    //   → si todo sale bien: guarda los cambios en la DB (commit)
    //   → si algo falla: deshace todo (rollback)
    //   → evita que queden datos a medias en la DB
    public RoomResponseDTO createRoom(RoomRequestDTO requestDTO) {

        // ── VALIDACIÓN: nombre único (HU #3) ──
        // Antes de crear, verificamos que no exista otra
        // habitación con el mismo nombre
        if (roomRepository.findByName(requestDTO.getName()).isPresent()) {
            throw new DuplicateNameException(
                    "Ya existe una habitación con el nombre: '"
                            + requestDTO.getName() + "'"
            );
        }

        // Convertimos el DTO que llegó del frontend
        // en una entidad Room para guardar en la DB
        Room newRoom = convertToEntity(requestDTO);

        // save() hace el INSERT en la DB
        // nos devuelve la Room ya guardada con el id generado
        Room savedRoom = roomRepository.save(newRoom);

        // Convertimos la entidad guardada en DTO de respuesta
        // para devolvérselo al frontend
        return convertToResponseDTO(savedRoom);
    }

    // ════════════════════════════════════════════
    // ELIMINAR UNA HABITACIÓN
    // Historia de Usuario #11: eliminar producto
    // Hard Delete → borra físicamente de la DB
    // como indica explícitamente la HU #11
    // ════════════════════════════════════════════
    @Transactional
    public void deleteRoom(Long id) {

        // Primero verificamos que la habitación existe
        // Si no existe → lanzamos excepción → HTTP 404
        roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Habitación no encontrada con id: " + id
                ));

        // Borra físicamente el registro de la DB
        // Cumple exactamente con la HU #11:
        // "el mismo debe eliminarse en la base de datos"
        roomRepository.deleteById(id);
    }

    // ════════════════════════════════════════════
    // MÉTODOS PRIVADOS: CONVERSIÓN ENTRE CAPAS
    // Estos métodos solo los usa esta clase
    // ════════════════════════════════════════════

    // Convierte Room (entidad DB) → RoomResponseDTO (lo que ve el frontend)
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

    // Convierte RoomRequestDTO (lo que manda el frontend) → Room (entidad DB)
    private Room convertToEntity(RoomRequestDTO dto) {
        return Room.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .imageRoom(dto.getImageRoom())
                .active(true) // toda habitación nueva arranca activa
                .build();
    }
}