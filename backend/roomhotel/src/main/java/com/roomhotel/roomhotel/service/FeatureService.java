package com.roomhotel.roomhotel.service;


import com.roomhotel.roomhotel.dto.FeatureRequestDTO;
import com.roomhotel.roomhotel.dto.FeatureResponseDTO;
import com.roomhotel.roomhotel.entity.Feature;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.FeatureRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeatureService {

    private final FeatureRepository featureRepository;

    // devuelve todas las features, endpoint público para que el frontend
    // pueda mostrarlas en RoomDetail sin necesitar token
    public List<FeatureResponseDTO> getAllFeatures(){
        return featureRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }


    // crea una nueva feature, solo desde ADMIN
    // valida duplicado de nombre antes de persistir para dar error
    public FeatureResponseDTO createFeature(FeatureRequestDTO dto){
        featureRepository.findByName(dto.getName()).ifPresent(f ->{
            throw new IllegalStateException(
                    "Ya existe una característica con el nombre: " + dto.getName()
            );
        });

        Feature feature = Feature.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .build();

        Feature saved = featureRepository.save(feature);
        return convertToResponseDTO(saved);
    }

    // elimina una feature por id, solo ADMIN
    @Transactional
    public void deleteFeature(Long id){
        Feature feature = featureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Característica no encontrada por id: " + id));

        // al eliminar una feature, también la desvinculamos de las rooms que la tenían asignada
        for (Room room : feature.getRooms()){
            room.getFeatures().remove(feature);
        }
        featureRepository.delete(feature);
    }


    // método reutilizable
    // convierte entidad a DTO en un solo lugar, igual que en RoomService
    private FeatureResponseDTO convertToResponseDTO(Feature feature){
        return FeatureResponseDTO.builder()
                .id(feature.getId())
                .name(feature.getName())
                .icon(feature.getIcon())
                .build();
    }

}
