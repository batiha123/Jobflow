package com.team.backend.controller;

import com.team.backend.dto.ApiResponse;
import com.team.backend.dto.ApplicationDto;
import com.team.backend.entity.enums.ApplicationStatus;
import com.team.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "Gestion des candidatures et téléversement de CV")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les candidatures")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getAll(
            @RequestParam(required = false) Long candidateId,
            @RequestParam(required = false) Long jobOfferId) {

        if (candidateId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Candidatures du candidat", service.findByCandidateId(candidateId)));
        }
        if (jobOfferId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Candidatures de l'offre", service.findByJobOfferId(jobOfferId)));
        }

        return ResponseEntity.ok(ApiResponse.ok("Liste des candidatures", service.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une candidature par son ID")
    public ResponseEntity<ApiResponse<ApplicationDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Candidature trouvée", service.findById(id)));
    }

    @GetMapping("/candidate/{candidateId}")
    @Operation(summary = "Récupérer les candidatures d'un candidat")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(ApiResponse.ok("Candidatures du candidat", service.findByCandidateId(candidateId)));
    }

    @GetMapping("/job/{jobOfferId}")
    @Operation(summary = "Récupérer les candidatures reçues pour une offre d'emploi")
    public ResponseEntity<ApiResponse<List<ApplicationDto>>> getByJobOffer(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(ApiResponse.ok("Candidatures pour cette offre", service.findByJobOfferId(jobOfferId)));
    }

    @PostMapping
    @Operation(summary = "Soumettre une nouvelle candidature")
    public ResponseEntity<ApiResponse<ApplicationDto>> create(@RequestBody ApplicationDto dto) {
        ApplicationDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Candidature soumise avec succès", created));
    }

    @PostMapping("/apply")
    @Operation(summary = "Postuler à une offre (alias compatible frontend)")
    public ResponseEntity<ApiResponse<ApplicationDto>> apply(@RequestBody ApplicationDto dto) {
        ApplicationDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Candidature soumise avec succès", created));
    }

    @PostMapping(value = "/upload-cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Téléverser un fichier CV (PDF, DOC, DOCX)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCv(@RequestParam("file") MultipartFile file) {
        String cvUrl = service.storeCv(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("CV téléversé avec succès", Collections.singletonMap("cvUrl", cvUrl)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mettre à jour le statut d'une candidature")
    public ResponseEntity<ApiResponse<ApplicationDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        ApplicationDto updated = service.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Statut de la candidature mis à jour", updated));
    }

    @RequestMapping(value = "/{id}/withdraw", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @Operation(summary = "Retirer une candidature (statut WITHDRAWN)")
    public ResponseEntity<ApiResponse<ApplicationDto>> withdraw(@PathVariable Long id) {
        ApplicationDto updated = service.updateStatus(id, ApplicationStatus.WITHDRAWN);
        return ResponseEntity.ok(ApiResponse.ok("Candidature retirée avec succès", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une candidature")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Candidature supprimée avec succès", null));
    }
}
