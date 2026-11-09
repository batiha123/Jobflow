package com.team.backend.service;

import com.team.backend.config.JwtUtils;
import com.team.backend.dto.AuthDto;
import com.team.backend.dto.UserDto;
import com.team.backend.entity.AdminProfile;
import com.team.backend.entity.CandidateProfile;
import com.team.backend.entity.User;
import com.team.backend.entity.enums.AccountStatus;
import com.team.backend.entity.enums.Role;
import com.team.backend.repository.AdminProfileRepository;
import com.team.backend.repository.CandidateProfileRepository;
import com.team.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(
            UserRepository userRepository,
            CandidateProfileRepository candidateProfileRepository,
            AdminProfileRepository adminProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils
    ) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.adminProfileRepository = adminProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Un compte existe déjà avec cette adresse email.");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CANDIDATE;

        User user = new User(
                request.getName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                role
        );
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // Automatically initialize empty profile for CANDIDATE or ADMIN
        if (role == Role.CANDIDATE && !candidateProfileRepository.existsByUserId(savedUser.getId())) {
            CandidateProfile candidateProfile = new CandidateProfile();
            candidateProfile.setUserId(savedUser.getId());
            candidateProfileRepository.save(candidateProfile);
        } else if (role == Role.ADMIN && !adminProfileRepository.existsByUserId(savedUser.getId())) {
            AdminProfile adminProfile = new AdminProfile();
            adminProfile.setUserId(savedUser.getId());
            adminProfileRepository.save(adminProfile);
        }

        String token = jwtUtils.generateToken(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getRole().name()
        );

        return new AuthDto.AuthResponse(token, UserDto.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aucun compte n'existe avec cette adresse email (" + normalizedEmail + "). Veuillez vérifier votre email ou créer un compte."
                ));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mot de passe incorrect. Veuillez vérifier votre mot de passe et réessayer.");
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new IllegalArgumentException("Votre compte a été suspendu par un administrateur.");
        }

        if (user.getAccountStatus() == AccountStatus.DELETED) {
            throw new IllegalArgumentException("Ce compte a été désactivé.");
        }

        String token = jwtUtils.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        return new AuthDto.AuthResponse(token, UserDto.fromEntity(user));
    }
}

