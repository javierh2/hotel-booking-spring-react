package com.roomhotel.roomhotel.service;

import com.roomhotel.roomhotel.dto.UserResponseDTO;
import com.roomhotel.roomhotel.entity.Role;
import com.roomhotel.roomhotel.entity.User;
import com.roomhotel.roomhotel.exception.ResourceNotFoundException;
import com.roomhotel.roomhotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // devuelve todos los usuarios; solo ROLE_ADMIN puede llamar este endpoint
    // el control de acceso lo hace SecurityConfig, no este método
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    // cambia el rol de un usuario, toggle entre ROLE_USER y ROLE_ADMIN
    // si el usuario ya es ADMIN pasa a USER, si es USER pasa a ADMIN
    // @Transactional por si el save falla y hace rollback
    @Transactional
    public UserResponseDTO updateRole(Long id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario no encontrado con id: " + id
                ));

        user.setRole(newRole);
        User saved = userRepository.save(user);
        return convertToResponseDTO(saved);
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}