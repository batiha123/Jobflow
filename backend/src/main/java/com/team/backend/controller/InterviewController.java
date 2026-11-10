package com.team.backend.controller;

import com.team.backend.dto.ApiResponse;
import com.team.backend.dto.InterviewDto;
import com.team.backend.entity.enums.InterviewStatus;
import com.team.backend.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@Tag(name = "Interviews", description = "Planification et suivi des entretiens de recrutement")
public class InterviewController {

    private final InterviewService service;

    public InterviewController(InterviewService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Récupérer tous les entretiens")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getAll(@RequestParam(required = false) Long applicationId) {
        if (applicationId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Entretiens de la candidature", service.findByApplicationId(applicationId)));
        }
        return ResponseEntity.ok(ApiResponse.ok("Liste de tous les entretiens", service.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un entretien par son ID")
    public ResponseEntity<ApiResponse<InterviewDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Entretien trouvé", service.findById(id)));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Récupérer les entretiens liés à une candidature")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(ApiResponse.ok("Entretiens de la candidature", service.findByApplicationId(applicationId)));
    }

    @PostMapping
    @Operation(summary = "Planifier un nouvel entretien")
    public ResponseEntity<ApiResponse<InterviewDto>> schedule(@RequestBody InterviewDto dto) {
        InterviewDto scheduled = service.schedule(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Entretien planifié avec succès", scheduled));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mettre à jour le statut d'un entretien")
    public ResponseEntity<ApiResponse<InterviewDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam InterviewStatus status) {
        InterviewDto updated = service.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Statut de l'entretien mis à jour", updated));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier les détails d'un entretien")
    public ResponseEntity<ApiResponse<InterviewDto>> update(
            @PathVariable Long id,
            @RequestBody InterviewDto dto) {
        InterviewDto updated = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Entretien mis à jour", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un entretien")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Entretien supprimé avec succès", null));
    }
}
