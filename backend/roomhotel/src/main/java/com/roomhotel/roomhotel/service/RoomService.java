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
import com.roomhotel.roomhotel.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

// le dice a Spring que esta clase es un componente de lógica de negocio
@Service
public class RoomService {

    // inyeccion de dependencias
    private final RoomRepository roomRepository;
    private final CategoryRepository categoryRepository;
    private final FeatureRepository featureRepository;
    private final BookingRepository bookingRepository;
    private final RatingRepository ratingRepository;
    private final FavoriteRepository favoriteRepository;

    public RoomService(RoomRepository roomRepository, CategoryRepository categoryRepository, FeatureRepository featureRepository, BookingRepository bookingRepository, RatingRepository ratingRepository, FavoriteRepository favoriteRepository) {
        this.roomRepository = roomRepository;
        this.categoryRepository = categoryRepository;
        this.featureRepository = featureRepository;
        this.bookingRepository = bookingRepository;
        this.ratingRepository = ratingRepository;
        this.favoriteRepository = favoriteRepository;
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
        if (requestDTO.getImages() != null) {room.setImages(requestDTO.getImages());}
        room.setFeatures(features);

        // save() sobre una entidad con id existente hace UPDATE, no INSERT
        Room saved = roomRepository.save(room);
        return convertToResponseDTO(saved);
    }

    // elimina un registro de la DB mediante HardDelete
    // antes de borrar la room, elimina en cascada todos los registros dependientes
    // para no violar las constraints de FK de FAVORITES, BOOKINGS y RATINGS
    @Transactional
    public void deleteRoom(Long id) {

        // verificacion de habitación existente antes de intentar borrar nada
        roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Habitación no encontrada con id: " + id
                ));

        // orden: primero borra las tablas hijo, luego la tabla padre
        // si borrára ROOMS primero, las FK constraints fallarían igual
        // ratings primero porque no tiene dependencias propias
        ratingRepository.deleteByRoomId(id);
        // luego favoritos
        favoriteRepository.deleteByRoomId(id);
        // luego bookings; va después de ratings porque ratings no depende de bookings
        bookingRepository.deleteByRoomId(id);

        // ultimo borra la room, sin registros hijo que la referencien
        roomRepository.deleteById(id);
    }

    // Convierte Room (entidad DB) a RoomResponseDTO (lo que ve el frontend)
    // si el room no tiene categoria designada devuelve null en ese campo
    // agrega averageRating y totalRatings calculados on-the-fly con RatingRepository
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

        // promedio calculado on-the-fly — siempre consistente, sin riesgo de desfase
        // findAverageStarsByRoomId devuelve null si no hay reseñas; usamos 0.0 como fallback
        Double avg = ratingRepository.findAverageStarsByRoomId(room.getId());
        Long total = ratingRepository.countByRoomId(room.getId());

        return RoomResponseDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .category(categoryDTO)
                .price(room.getPrice())
                .images(room.getImages())
                .active(room.getActive())
                .features(featureDTOs)
                // null → 0.0 para que el frontend no tenga que manejar null
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                // casteamos Long a Integer — countByRoomId nunca va a superar Integer.MAX_VALUE
                .totalRatings(total.intValue())
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
                .images(dto.getImages() != null ? dto.getImages() : new ArrayList<>())
                .active(true) // toda habitación nueva arranca en "active" (disponible)
                .features(features)
                .build();
    }

    // devuelve los rooms que no tienen reservas en el rango checkIn-checkOut
    public List<RoomResponseDTO> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {

        // checkOut debe ser posterior a checkIn
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException(
                    "La fecha de salida debe ser posterior a la fecha de entrada"
            );
        }

        // ids de rooms con reservas superpuestas
        List<Long> occupiedIds = bookingRepository.findOccupiedRoomIds(checkIn, checkOut);

        // todas las rooms excepto las ocupadas
        // si occupiedIds está vacío, el contains() nunca es true y se devuelven todas
        return roomRepository.findAll()
                .stream()
                .filter(room -> !occupiedIds.contains(room.getId()))
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
}