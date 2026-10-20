package com.team.backend.controller;

import com.team.backend.dto.JobOfferDTO;
import com.team.backend.service.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobOfferController {

    @Autowired
    private JobOfferService jobOfferService;

    @GetMapping
    public ResponseEntity<List<JobOfferDTO>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String contractType) {
        List<JobOfferDTO> jobs = jobOfferService.getPublishedOffers(keyword, location, contractType);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDTO> getJobById(@PathVariable Long id) {
        JobOfferDTO job = jobOfferService.getOfferById(id);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/company/{userId}")
    public ResponseEntity<List<JobOfferDTO>> getCompanyOffers(@PathVariable Long userId) {
        List<JobOfferDTO> jobs = jobOfferService.getCompanyOffers(userId);
        return ResponseEntity.ok(jobs);
    }

    @PostMapping
    public ResponseEntity<JobOfferDTO> createOffer(
            @RequestParam(required = false) Long userId,
            @RequestBody JobOfferDTO dto) {
        Long targetUserId = userId != null ? userId : dto.getCompanyId();
        if (targetUserId == null) {
            throw new RuntimeException("L'identifiant de l'entreprise est obligatoire.");
        }
        JobOfferDTO created = jobOfferService.createOffer(targetUserId, dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferDTO> updateOffer(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestBody JobOfferDTO dto) {
        JobOfferDTO updated = jobOfferService.updateOffer(id, userId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOffer(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        jobOfferService.deleteOffer(id, userId);
        return ResponseEntity.ok(Map.of("message", "Offre supprimée avec succès."));
    }
}
