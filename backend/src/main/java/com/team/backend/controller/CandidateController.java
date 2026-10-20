package com.team.backend.controller;

import com.team.backend.dto.CandidateProfileDTO;
import com.team.backend.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<CandidateProfileDTO> getProfile(@PathVariable Long userId) {
        CandidateProfileDTO profile = candidateService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<CandidateProfileDTO> updateProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfileDTO dto) {
        CandidateProfileDTO updated = candidateService.updateProfile(userId, dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/upload-cv/{userId}")
    public ResponseEntity<Map<String, String>> uploadCv(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String cvUrl = body.get("cvUrl");
        String result = candidateService.uploadCv(userId, cvUrl);
        return ResponseEntity.ok(Map.of("message", "CV enregistré avec succès", "cvUrl", result));
    }
}
