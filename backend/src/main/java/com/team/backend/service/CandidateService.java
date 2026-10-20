package com.team.backend.service;

import com.team.backend.dto.CandidateProfileDTO;
import com.team.backend.entity.CandidateProfile;
import com.team.backend.entity.User;
import com.team.backend.repository.CandidateProfileRepository;
import com.team.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public CandidateProfileDTO getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + userId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProf = new CandidateProfile();
                    newProf.setUserId(userId);
                    return candidateProfileRepository.save(newProf);
                });

        CandidateProfileDTO dto = new CandidateProfileDTO();
        dto.setId(profile.getId());
        dto.setUserId(userId);
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setPhotoUrl(profile.getPhotoUrl());
        dto.setHeadline(profile.getHeadline());
        dto.setAboutMe(profile.getAboutMe());
        dto.setSkills(profile.getSkills());
        dto.setEducation(profile.getEducation());
        dto.setExperience(profile.getExperience());

        return dto;
    }

    @Transactional
    public CandidateProfileDTO updateProfile(Long userId, CandidateProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + userId));

        // Update user contact info
        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            user.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        userRepository.save(user);

        // Update candidate profile
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProf = new CandidateProfile();
                    newProf.setUserId(userId);
                    return newProf;
                });

        profile.setHeadline(dto.getHeadline());
        profile.setAboutMe(dto.getAboutMe());
        profile.setSkills(dto.getSkills());
        profile.setEducation(dto.getEducation());
        profile.setExperience(dto.getExperience());
        if (dto.getPhotoUrl() != null) {
            profile.setPhotoUrl(dto.getPhotoUrl());
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);

        dto.setId(saved.getId());
        dto.setUserId(userId);
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        return dto;
    }

    @Transactional
    public String uploadCv(Long userId, String cvUrl) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil candidat introuvable"));
        
        // In this architecture, cvUrl is stored with the candidate's applications and profile
        candidateProfileRepository.save(profile);
        return cvUrl;
    }
}
