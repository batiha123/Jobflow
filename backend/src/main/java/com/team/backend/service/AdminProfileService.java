package com.team.backend.service;

import com.team.backend.dto.AdminProfileDto;
import com.team.backend.entity.AdminProfile;
import com.team.backend.entity.User;
import com.team.backend.repository.AdminProfileRepository;
import com.team.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminProfileService {

    private final AdminProfileRepository adminProfileRepository;
    private final UserRepository userRepository;

    public AdminProfileService(
            AdminProfileRepository adminProfileRepository,
            UserRepository userRepository
    ) {
        this.adminProfileRepository = adminProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AdminProfileDto getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable avec l'email : " + email));
        return getProfileByUserId(user.getId());
    }

    @Transactional
    public AdminProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable avec l'identifiant : " + userId));

        AdminProfile profile = adminProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    AdminProfile created = new AdminProfile();
                    created.setUserId(userId);
                    return adminProfileRepository.save(created);
                });

        return AdminProfileDto.fromEntities(profile, user);
    }

    @Transactional
    public AdminProfileDto updateProfileByEmail(String email, AdminProfileDto.UpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable avec l'email : " + email));
        return updateProfileByUserId(user.getId(), request);
    }

    @Transactional
    public AdminProfileDto updateProfileByUserId(Long userId, AdminProfileDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable avec l'identifiant : " + userId));

        if (StringUtils.hasText(request.getName())) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        AdminProfile profile = adminProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    AdminProfile created = new AdminProfile();
                    created.setUserId(userId);
                    return created;
                });

        if (request.getPosition() != null) {
            profile.setPosition(request.getPosition());
        }
        if (request.getDepartment() != null) {
            profile.setDepartment(request.getDepartment());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getPhotoUrl() != null) {
            profile.setPhotoUrl(request.getPhotoUrl());
        }

        AdminProfile saved = adminProfileRepository.save(profile);
        return AdminProfileDto.fromEntities(saved, user);
    }
}
