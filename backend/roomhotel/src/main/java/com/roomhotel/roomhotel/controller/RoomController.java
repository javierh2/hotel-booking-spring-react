package com.roomhotel.roomhotel.controller;

import com.roomhotel.roomhotel.dto.RoomRequestDTO;
import com.roomhotel.roomhotel.dto.RoomResponseDTO;
import com.roomhotel.roomhotel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController // pedidos en http y devuelven en formato JSON
@RequestMapping("/api/rooms") // prefijo de URL para todos los endpoints "/api/rooms"
@CrossOrigin(origins = "http://localhost:5173") //conexion de React con su puerto al backend
public class  RoomController {

    // inyeccion de dependencias
    // Controller necesita el Service para delegar la lógica
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }


    // GET /api/rooms
    // Trae todas las habitaciones
    @GetMapping
    public ResponseEntity<List<RoomResponseDTO>> getAllRooms() {
        List<RoomResponseDTO> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }


    // GET /api/rooms/random
    // 10 habitaciones de forma aletoria
    @GetMapping("/random")
    public ResponseEntity<List<RoomResponseDTO>> getRandomRooms() {
        List<RoomResponseDTO> rooms = roomService.getRandomRooms();
        return ResponseEntity.ok(rooms);
    }


    // GET /api/rooms/{id}
    // habitación específica por su id
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponseDTO> getRoomById(@PathVariable Long id) {
        RoomResponseDTO room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }


    // POST /api/rooms
    // Crea una habitación nueva
    @PostMapping
    public ResponseEntity<RoomResponseDTO> createRoom(
            @Valid @RequestBody RoomRequestDTO requestDTO) {
        // @RequestBody convierte el JSON que llega
        // en un objeto RoomRequestDTO automáticamente
        // @Valid activa las validaciones del DTO sino GlobalExceptionHandler devuelve HTTP 400
        RoomResponseDTO created = roomService.createRoom(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    // PUT /api/rooms/{id}
    // Actualiza una habitación existente — HU #12
    // PUT porque reemplazamos todos los campos editables del recurso
        @PutMapping("/{id}")
        public ResponseEntity<RoomResponseDTO> updateRoom(
                @PathVariable Long id,
                @Valid @RequestBody RoomRequestDTO requestDTO) {
            RoomResponseDTO updated = roomService.updateRoom(id, requestDTO);
            return ResponseEntity.ok(updated);
        }


    // DELETE /api/rooms/{id}
    // Elimina una habitación por id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}