package com.team.backend.controller;

import com.team.backend.dto.ApiResponse;
import com.team.backend.dto.TestAttemptDto;
import com.team.backend.service.TestAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/test-attempts")
@Tag(name = "Test Attempts", description = "Passage et évaluation des tests techniques par les candidats")
public class TestAttemptController {

    private final TestAttemptService service;

    public TestAttemptController(TestAttemptService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les tentatives de test")
    public ResponseEntity<ApiResponse<List<TestAttemptDto>>> getAll(
            @RequestParam(required = false) Long testId,
            @RequestParam(required = false) Long applicationId) {

        if (testId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Tentatives pour ce test", service.findByTestId(testId)));
        }
        if (applicationId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Tentatives pour cette candidature", service.findByApplicationId(applicationId)));
        }

        return ResponseEntity.ok(ApiResponse.ok("Liste des tentatives", service.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une tentative par son ID")
    public ResponseEntity<ApiResponse<TestAttemptDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Tentative trouvée", service.findById(id)));
    }

    @GetMapping("/test/{testId}")
    @Operation(summary = "Récupérer les tentatives d'un test")
    public ResponseEntity<ApiResponse<List<TestAttemptDto>>> getByTest(@PathVariable Long testId) {
        return ResponseEntity.ok(ApiResponse.ok("Tentatives pour ce test", service.findByTestId(testId)));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Récupérer les tentatives d'une candidature")
    public ResponseEntity<ApiResponse<List<TestAttemptDto>>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(ApiResponse.ok("Tentatives pour cette candidature", service.findByApplicationId(applicationId)));
    }

    @PostMapping("/start")
    @Operation(summary = "Démarrer une nouvelle tentative de test")
    public ResponseEntity<ApiResponse<TestAttemptDto>> start(
            @RequestParam Long testId,
            @RequestParam Long applicationId) {
        TestAttemptDto started = service.startAttempt(testId, applicationId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tentative de test démarrée", started));
    }

    @PostMapping("/submit")
    @Operation(summary = "Soumettre un test candidat et enregistrer le score")
    public ResponseEntity<ApiResponse<TestAttemptDto>> submit(@RequestBody TestAttemptDto dto) {
        TestAttemptDto submitted = service.submitAttempt(dto);
        return ResponseEntity.ok(ApiResponse.ok("Test soumis avec succès", submitted));
    }

    @PatchMapping("/{id}/submit")
    @Operation(summary = "Finaliser une tentative existante avec le score obtenu")
    public ResponseEntity<ApiResponse<TestAttemptDto>> submitById(
            @PathVariable Long id,
            @RequestParam BigDecimal score) {
        TestAttemptDto submitted = service.submitAttemptById(id, score);
        return ResponseEntity.ok(ApiResponse.ok("Score enregistré avec succès", submitted));
    }
}
