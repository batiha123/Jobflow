package com.team.backend.service;

import com.team.backend.dto.UserDto;
import com.team.backend.entity.User;
import com.team.backend.entity.enums.AccountStatus;
import com.team.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = findEntityByEmail(email);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateCurrentUser(String email, UserDto.UpdateUserRequest request) {
        User user = findEntityByEmail(email);

        if (StringUtils.hasText(request.getName())) {
            user.setName(request.getName().trim());
        }

        if (StringUtils.hasText(request.getEmail())) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Cette adresse email est déjà utilisée par un autre compte.");
            }
            user.setEmail(newEmail);
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = findEntityById(id);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto activateUser(Long id) {
        return updateAccountStatus(id, AccountStatus.ACTIVE);
    }

    @Transactional
    public UserDto suspendUser(Long id) {
        return updateAccountStatus(id, AccountStatus.SUSPENDED);
    }

    @Transactional
    public UserDto updateAccountStatus(Long id, AccountStatus status) {
        User user = findEntityById(id);
        user.setAccountStatus(status);
        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }

    private User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'identifiant : " + id));
    }

    private User findEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'email : " + email));
    }
}
