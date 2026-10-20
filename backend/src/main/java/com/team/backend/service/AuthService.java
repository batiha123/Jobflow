package com.team.backend.service;

import com.team.backend.dto.AuthResponse;
import com.team.backend.dto.LoginRequest;
import com.team.backend.dto.RegisterRequest;
import com.team.backend.entity.CandidateProfile;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.entity.User;
import com.team.backend.entity.enums.AccountStatus;
import com.team.backend.entity.enums.Role;
import com.team.backend.repository.CandidateProfileRepository;
import com.team.backend.repository.CompanyProfileRepository;
import com.team.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // 1. Verify email uniqueness
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Cet email est déjà associé à un compte !");
        }

        // 2. Hash password with BCrypt
        String hashedPassword = passwordEncoder.encode(req.getPassword());

        // 3. Create and save User in MySQL
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPasswordHash(hashedPassword);
        user.setPhone(req.getPhone());
        user.setRole(req.getRole() != null ? req.getRole() : Role.CANDIDATE);
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // 4. Automatically create corresponding Profile (Company or Candidate)
        Long profileId = null;

        if (savedUser.getRole() == Role.COMPANY) {
            CompanyProfile company = new CompanyProfile();
            company.setUserId(savedUser.getId());
            company.setCompanyName(req.getCompanyName() != null && !req.getCompanyName().isBlank()
                    ? req.getCompanyName()
                    : savedUser.getName() + " Entreprise");
            company.setDescription("Entreprise récemment inscrite sur JobFlow.");
            company.setAddress("France");
            CompanyProfile savedCompany = companyProfileRepository.save(company);
            profileId = savedCompany.getId();
        } else if (savedUser.getRole() == Role.CANDIDATE) {
            CandidateProfile candidate = new CandidateProfile();
            candidate.setUserId(savedUser.getId());
            candidate.setHeadline("Nouveau talent sur JobFlow");
            candidate.setAboutMe("En recherche active de nouvelles opportunités professionnelles.");
            CandidateProfile savedCandidate = candidateProfileRepository.save(candidate);
            profileId = savedCandidate.getId();
        }

        AuthResponse response = new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole(),
                savedUser.getAccountStatus(),
                "Inscription réussie !"
        );
        response.setProfileId(profileId);
        return response;
    }

    public AuthResponse login(LoginRequest req) {
        // 1. Find user by email
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Identifiants incorrects."));

        // 2. Check password matches (supports BCrypt and raw seed passwords)
        boolean passwordMatches = passwordEncoder.matches(req.getPassword(), user.getPasswordHash())
                || req.getPassword().equals(user.getPasswordHash());

        if (!passwordMatches) {
            throw new RuntimeException("Identifiants incorrects.");
        }

        // 3. Check account status
        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new RuntimeException("Ce compte est suspendu. Veuillez contacter le support.");
        }
        if (user.getAccountStatus() == AccountStatus.DELETED) {
            throw new RuntimeException("Ce compte a été supprimé.");
        }

        // 4. Retrieve linked profile ID
        Long profileId = null;
        if (user.getRole() == Role.COMPANY) {
            profileId = companyProfileRepository.findByUserId(user.getId())
                    .map(CompanyProfile::getId).orElse(null);
        } else if (user.getRole() == Role.CANDIDATE) {
            profileId = candidateProfileRepository.findByUserId(user.getId())
                    .map(CandidateProfile::getId).orElse(null);
        }

        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAccountStatus(),
                "Connexion réussie !"
        );
        response.setProfileId(profileId);
        return response;
    }

    public AuthResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAccountStatus(),
                "Profil récupéré."
        );
    }
}
