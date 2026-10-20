package com.team.backend.service;

import com.team.backend.dto.CompanyProfileDTO;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.entity.User;
import com.team.backend.repository.CompanyProfileRepository;
import com.team.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyProfileRepository companyProfileRepository;
    private final UserRepository userRepository;

    public CompanyService(CompanyProfileRepository companyProfileRepository, UserRepository userRepository) {
        this.companyProfileRepository = companyProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CompanyProfileDTO getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        CompanyProfile profile = companyProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile newProf = new CompanyProfile();
                    newProf.setUserId(userId);
                    newProf.setCompanyName(user.getName() != null ? user.getName() : "Mon Entreprise");
                    return companyProfileRepository.save(newProf);
                });

        return toDTO(profile, user);
    }

    @Transactional
    public CompanyProfileDTO updateProfile(Long userId, CompanyProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        CompanyProfile profile = companyProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile newProf = new CompanyProfile();
                    newProf.setUserId(userId);
                    return newProf;
                });

        if (dto.getCompanyName() != null) profile.setCompanyName(dto.getCompanyName());
        if (dto.getDescription() != null) profile.setDescription(dto.getDescription());
        if (dto.getAddress() != null) profile.setAddress(dto.getAddress());
        if (dto.getWebsite() != null) profile.setWebsite(dto.getWebsite());
        if (dto.getLogoUrl() != null) profile.setLogoUrl(dto.getLogoUrl());

        CompanyProfile saved = companyProfileRepository.save(profile);

        if (dto.getContactPhone() != null) {
            user.setPhone(dto.getContactPhone());
            userRepository.save(user);
        }

        return toDTO(saved, user);
    }

    @Transactional(readOnly = true)
    public List<CompanyProfileDTO> getAllCompanies() {
        return companyProfileRepository.findAll().stream().map(profile -> {
            User user = userRepository.findById(profile.getUserId()).orElse(null);
            return toDTO(profile, user);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyProfileDTO getCompanyById(Long id) {
        CompanyProfile profile = companyProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise introuvable."));
        User user = userRepository.findById(profile.getUserId()).orElse(null);
        return toDTO(profile, user);
    }

    private CompanyProfileDTO toDTO(CompanyProfile profile, User user) {
        CompanyProfileDTO dto = new CompanyProfileDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setCompanyName(profile.getCompanyName());
        dto.setDescription(profile.getDescription());
        dto.setAddress(profile.getAddress());
        dto.setWebsite(profile.getWebsite());
        dto.setLogoUrl(profile.getLogoUrl());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());

        if (user != null) {
            dto.setContactEmail(user.getEmail());
            dto.setContactPhone(user.getPhone());
        }

        return dto;
    }
}
