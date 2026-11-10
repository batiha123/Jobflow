package com.team.backend.controller;

import com.team.backend.dto.CompanyProfileRequest;
import com.team.backend.dto.CompanyProfileResponse;
import com.team.backend.service.CompanyProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyProfileController {

    private final CompanyProfileService companyProfileService;

    public CompanyProfileController(CompanyProfileService companyProfileService) {
        this.companyProfileService = companyProfileService;
    }

    @GetMapping
    public ResponseEntity<List<CompanyProfileResponse>> getPublicProfiles() {
        return ResponseEntity.ok(companyProfileService.getPublicProfiles());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyProfileResponse> getMyProfile() {
        return ResponseEntity.ok(companyProfileService.getMyProfile());
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyProfileResponse> createMyProfile(
            @Valid @RequestBody CompanyProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyProfileService.createMyProfile(request));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyProfileResponse> updateMyProfile(
            @Valid @RequestBody CompanyProfileRequest request) {
        return ResponseEntity.ok(companyProfileService.updateMyProfile(request));
    }

    @PostMapping("/me/logo")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyProfileResponse> uploadMyLogo(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(companyProfileService.uploadMyLogo(file));
    }

    @DeleteMapping("/me/logo")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyProfileResponse> deleteMyLogo() {
        return ResponseEntity.ok(companyProfileService.deleteMyLogo());
    }
}
