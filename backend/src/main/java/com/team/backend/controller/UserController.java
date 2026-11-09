package com.team.backend.controller;

import com.team.backend.dto.ApiResponse;
import com.team.backend.dto.UserDto;
import com.team.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        UserDto dto = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Profil utilisateur récupéré", dto));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UserDto.UpdateUserRequest request
    ) {
        UserDto dto = userService.updateCurrentUser(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profil utilisateur mis à jour", dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Liste des utilisateurs récupérée", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto dto = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Utilisateur récupéré", dto));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> activateUser(@PathVariable Long id) {
        UserDto dto = userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Compte utilisateur activé", dto));
    }

    @PatchMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> suspendUser(@PathVariable Long id) {
        UserDto dto = userService.suspendUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Compte utilisateur suspendu", dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserDto.StatusUpdateRequest request
    ) {
        UserDto dto = userService.updateAccountStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Statut du compte mis à jour", dto));
    }
}
