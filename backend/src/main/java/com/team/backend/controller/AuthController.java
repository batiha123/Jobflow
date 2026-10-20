package com.team.backend.controller;

import com.team.backend.dto.AuthResponse;
import com.team.backend.dto.LoginRequest;
import com.team.backend.dto.RegisterRequest;
import com.team.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification & Comptes", description = "Endpoints pour l'inscription et la connexion des utilisateurs")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Créer un nouveau compte (Candidat ou Entreprise)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter avec email et mot de passe")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{id}")
    @Operation(summary = "Récupérer les informations du profil utilisateur")
    public ResponseEntity<AuthResponse> getUserProfile(@PathVariable Long id) {
        AuthResponse response = authService.getCurrentUser(id);
        return ResponseEntity.ok(response);
    }
}
