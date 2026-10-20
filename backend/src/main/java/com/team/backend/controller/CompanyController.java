package com.team.backend.controller;

import com.team.backend.dto.CompanyProfileDTO;
import com.team.backend.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<List<CompanyProfileDTO>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyProfileDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CompanyProfileDTO> getProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(companyService.getProfileByUserId(userId));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<CompanyProfileDTO> updateProfile(@PathVariable Long userId,
                                                          @RequestBody CompanyProfileDTO dto) {
        return ResponseEntity.ok(companyService.updateProfile(userId, dto));
    }
}
