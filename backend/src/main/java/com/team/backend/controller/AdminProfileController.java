package com.team.backend.controller;

import com.team.backend.dto.AdminProfileDto;
import com.team.backend.dto.ApiResponse;
import com.team.backend.service.AdminProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin-profiles")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {

    private final AdminProfileService adminProfileService;

    public AdminProfileController(AdminProfileService adminProfileService) {
        this.adminProfileService = adminProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminProfileDto>> getMyAdminProfile(Authentication authentication) {
        AdminProfileDto dto = adminProfileService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Profil administrateur récupéré", dto));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AdminProfileDto>> updateMyAdminProfile(
            Authentication authentication,
            @Valid @RequestBody AdminProfileDto.UpdateRequest request
    ) {
        AdminProfileDto dto = adminProfileService.updateProfileByEmail(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profil administrateur mis à jour", dto));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminProfileDto>> getAdminProfileByUserId(@PathVariable Long userId) {
        AdminProfileDto dto = adminProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("Profil administrateur récupéré", dto));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminProfileDto>> updateAdminProfileByUserId(
            @PathVariable Long userId,
            @Valid @RequestBody AdminProfileDto.UpdateRequest request
    ) {
        AdminProfileDto dto = adminProfileService.updateProfileByUserId(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profil administrateur mis à jour", dto));
    }
}
