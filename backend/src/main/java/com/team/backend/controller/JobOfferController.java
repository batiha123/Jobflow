package com.team.backend.controller;

import com.team.backend.dto.JobOfferRequest;
import com.team.backend.dto.JobOfferResponse;
import com.team.backend.entity.enums.ContractType;
import com.team.backend.entity.enums.JobStatus;
import com.team.backend.service.JobOfferService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
public class JobOfferController {

    private final JobOfferService jobOfferService;

    public JobOfferController(JobOfferService jobOfferService) {
        this.jobOfferService = jobOfferService;
    }

    @PostMapping
    public ResponseEntity<JobOfferResponse> createOffer(
            @Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobOfferService.createOffer(request));
    }

    @GetMapping("/mine")
    public ResponseEntity<Page<JobOfferResponse>> getMyOffers(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ContractType contractType,
            @RequestParam(required = false) JobStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(
                jobOfferService.searchMyOffers(title, location, contractType, status, pageable));
    }

    @GetMapping("/mine/{id}")
    public ResponseEntity<JobOfferResponse> getMyOfferById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getMyOfferById(id));
    }

    @PutMapping("/mine/{id}")
    public ResponseEntity<JobOfferResponse> updateMyOffer(
            @PathVariable Long id,
            @Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.ok(jobOfferService.updateMyOffer(id, request));
    }

    @PatchMapping("/mine/{id}/submit")
    public ResponseEntity<JobOfferResponse> submitMyOffer(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.submitMyOffer(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<JobOfferResponse> approveOffer(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.approveOffer(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<JobOfferResponse> rejectOffer(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.rejectOffer(id));
    }

    @PatchMapping("/mine/{id}/close")
    public ResponseEntity<JobOfferResponse> closeMyOffer(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.closeMyOffer(id));
    }

    @DeleteMapping("/mine/{id}")
    public ResponseEntity<Void> deleteMyOffer(@PathVariable Long id) {
        jobOfferService.deleteMyOffer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<JobOfferResponse>> getPublicOffers(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ContractType contractType,
            Pageable pageable) {
        return ResponseEntity.ok(
                jobOfferService.searchPublicOffers(title, location, contractType, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferResponse> getPublicOfferById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getPublicOfferById(id));
    }
}
