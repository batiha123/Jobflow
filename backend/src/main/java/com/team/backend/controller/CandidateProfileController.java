package com.team.backend.controller;

import com.team.backend.dto.ApiResponse;
import com.team.backend.dto.CandidateProfileDto;
import com.team.backend.service.CandidateProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/candidate-profiles", "/api/candidates"})
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    public CandidateProfileController(CandidateProfileService candidateProfileService) {
        this.candidateProfileService = candidateProfileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getMyProfile(Authentication authentication) {
        CandidateProfileDto dto = candidateProfileService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Profil candidat récupéré", dto));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody CandidateProfileDto.UpdateRequest request
    ) {
        CandidateProfileDto dto = candidateProfileService.updateProfileByEmail(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profil candidat mis à jour", dto));
    }

    @GetMapping({"/{userId}", "/user/{userId}"})
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getProfileByUserId(@PathVariable Long userId) {
        CandidateProfileDto dto = candidateProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("Profil candidat récupéré", dto));
    }

    @PutMapping({"/{userId}", "/user/{userId}"})
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateProfileByUserId(
            @PathVariable Long userId,
            @Valid @RequestBody CandidateProfileDto.UpdateRequest request
    ) {
        CandidateProfileDto dto = candidateProfileService.updateProfileByUserId(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profil candidat mis à jour", dto));
    }
}
