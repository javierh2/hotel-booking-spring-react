package com.roomhotel.roomhotel.service;

import com.roomhotel.roomhotel.dto.CategoryResponseDTO;
import com.roomhotel.roomhotel.dto.FeatureResponseDTO;
import com.roomhotel.roomhotel.dto.RoomRequestDTO;
import com.roomhotel.roomhotel.dto.RoomResponseDTO;
import com.roomhotel.roomhotel.entity.Category;
import com.roomhotel.roomhotel.entity.Feature;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.exception.DuplicateNameException;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.CategoryRepository;
import com.roomhotel.roomhotel.repository.FeatureRepository;
import com.roomhotel.roomhotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

// le dice a Spring que esta clase es un componente de lógica de negocio
@Service
public class RoomService {

    // inyeccion de dependencias
    private final RoomRepository roomRepository;
    private final CategoryRepository categoryRepository;
    private final FeatureRepository featureRepository;

    public RoomService(RoomRepository roomRepository, CategoryRepository categoryRepository, FeatureRepository featureRepository) {
        this.roomRepository = roomRepository;
        this.categoryRepository = categoryRepository;
        this.featureRepository = featureRepository;
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
    // @Transactional ,si funciona impacta en la DB, sino, hace rollback, evita datos incompletos en la DB
    @Transactional

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

    // actualizar habitación, solo desde ADMIN, PUT semántico, reemplaza todos los campos editables del recurso
    @Transactional
    public RoomResponseDTO updateRoom(Long id, RoomRequestDTO requestDTO) {

        // verificamos que la habitación existe antes de modificarla
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Habitación no encontrada con id: " + id
                ));

        // validación de nombre único, permite mantener el mismo nombre de la habitación que estamos editando, pero no repetir el nombre de otra habitación
        if (!room.getName().equals(requestDTO.getName()) &&
                roomRepository.findByName(requestDTO.getName()).isPresent()) {
            throw new DuplicateNameException(
                    "Ya existe una habitación con el nombre: '"
                            + requestDTO.getName() + "'"
            );
        }

        // categoría igual que en convertToEntity, si el front manda categoryId, busca la categoría en la DB, si no existe, lanza error, si no se manda categoryId, queda null (sin categoría)
        Category category = null;
        if (requestDTO.getCategoryId() != null) {
            category = categoryRepository.findById(requestDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoría no encontrada con id: " + requestDTO.getCategoryId()
                    ));
        }

        // resolvemos las features igual que en convertToEntity
        Set<Feature> features = new HashSet<>();
        if (requestDTO.getFeatureIds() != null && !requestDTO.getFeatureIds().isEmpty()) {
            for (Long featureId : requestDTO.getFeatureIds()) {
                Feature feature = featureRepository.findById(featureId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Característica no encontrada con id: " + featureId
                        ));
                features.add(feature);
            }
        }

        // modificamos la entidad existente en lugar de crear una nueva
        // esto preserva el id y cualquier campo que no editemos (ej: active)
        room.setName(requestDTO.getName());
        room.setDescription(requestDTO.getDescription());
        room.setCategory(category);
        room.setPrice(requestDTO.getPrice());
        room.setImageRoom(requestDTO.getImageRoom());
        room.setFeatures(features);

        // save() sobre una entidad con id existente hace UPDATE, no INSERT
        Room saved = roomRepository.save(room);
        return convertToResponseDTO(saved);
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
    // si el room no tiene categoria designada devuelve null en ese campo
    private RoomResponseDTO convertToResponseDTO(Room room) {
        CategoryResponseDTO categoryDTO = null;
        if (room.getCategory() != null){
            categoryDTO = CategoryResponseDTO.builder()
                    .id(room.getCategory().getId())
                    .title(room.getCategory().getTitle())
                    .description(room.getCategory().getDescription())
                    .imageUrl(room.getCategory().getImageUrl())
                    .build();
        }

        // conversion del set<Feature> a list<FeatureResponseDTO> para el frontend
        List<FeatureResponseDTO> featureDTOs = room.getFeatures()
                .stream()
                .map(feature -> FeatureResponseDTO.builder()
                        .id(feature.getId())
                        .name(feature.getName())
                        .icon(feature.getIcon())
                        .build())
                .collect(Collectors.toList());

        return RoomResponseDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .category(categoryDTO)
                .price(room.getPrice())
                .imageRoom(room.getImageRoom())
                .active(room.getActive())
                .features(featureDTOs)
                .build();
    }


    // Convierte RoomRequestDTO (lo que manda el frontend) a Room (entidad DB)
    // si el front manda un categoryId, se buscar la categoria en la DB
    // si no existe, el room se crea sin categoria
    private Room convertToEntity(RoomRequestDTO dto) {
        Category category = null;
        if (dto.getCategoryId() != null){
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoria no encontrada con id: " + dto.getCategoryId()
                    ));
        }

        // con las features, buscamos cada id en la DB, con manejo de lista vacia o featureIds nulo y manejo de error
        Set<Feature> features = new HashSet<>();
        if (dto.getFeatureIds() != null && !dto.getFeatureIds().isEmpty()){
            for (Long featureId : dto.getFeatureIds()) {
                Feature feature = featureRepository.findById(featureId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Característica no encontrada con id: " + featureId
                        ));
                features.add(feature);
            }
        }


        return Room.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(category)
                .price(dto.getPrice())
                .imageRoom(dto.getImageRoom())
                .active(true) // toda habitación nueva arranca en "active" (disponible)
                .features(features)
                .build();
    }
}