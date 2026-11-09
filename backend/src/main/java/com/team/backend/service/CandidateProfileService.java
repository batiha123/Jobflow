package com.team.backend.service;

import com.team.backend.dto.CandidateProfileDto;
import com.team.backend.entity.CandidateProfile;
import com.team.backend.entity.User;
import com.team.backend.repository.CandidateProfileRepository;
import com.team.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    public CandidateProfileService(
            CandidateProfileRepository candidateProfileRepository,
            UserRepository userRepository
    ) {
        this.candidateProfileRepository = candidateProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CandidateProfileDto getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'email : " + email));
        return getProfileByUserId(user.getId());
    }

    @Transactional
    public CandidateProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'identifiant : " + userId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile created = new CandidateProfile();
                    created.setUserId(userId);
                    return candidateProfileRepository.save(created);
                });

        return CandidateProfileDto.fromEntities(profile, user);
    }

    @Transactional
    public CandidateProfileDto updateProfileByEmail(String email, CandidateProfileDto.UpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'email : " + email));
        return updateProfileByUserId(user.getId(), request);
    }

    @Transactional
    public CandidateProfileDto updateProfileByUserId(Long userId, CandidateProfileDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'identifiant : " + userId));

        if (StringUtils.hasText(request.getName())) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile created = new CandidateProfile();
                    created.setUserId(userId);
                    return created;
                });

        if (request.getPhotoUrl() != null) {
            profile.setPhotoUrl(request.getPhotoUrl());
        }
        if (request.getHeadline() != null) {
            profile.setHeadline(request.getHeadline());
        }
        if (request.getAboutMe() != null) {
            profile.setAboutMe(request.getAboutMe());
        }
        if (request.getSkills() != null) {
            profile.setSkills(request.getSkills());
        }
        if (request.getEducation() != null) {
            profile.setEducation(request.getEducation());
        }
        if (request.getExperience() != null) {
            profile.setExperience(request.getExperience());
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return CandidateProfileDto.fromEntities(saved, user);
    }
}

