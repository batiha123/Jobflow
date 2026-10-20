package com.team.backend.controller;

import com.team.backend.dto.ApplicationResponseDTO;
import com.team.backend.dto.ApplyRequest;
import com.team.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/apply")
    public ResponseEntity<ApplicationResponseDTO> apply(@RequestBody ApplyRequest request) {
        ApplicationResponseDTO response = applicationService.apply(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/candidate/{userId}")
    public ResponseEntity<List<ApplicationResponseDTO>> getCandidateApplications(@PathVariable Long userId) {
        List<ApplicationResponseDTO> applications = applicationService.getCandidateApplications(userId);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationResponseDTO> withdrawApplication(
            @PathVariable Long id,
            @RequestParam Long userId) {
        ApplicationResponseDTO response = applicationService.withdrawApplication(id, userId);
        return ResponseEntity.ok(response);
    }
}
