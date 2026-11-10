package com.team.backend.controller;

import com.team.backend.dto.ApiResponse;
import com.team.backend.dto.TestAttemptDto;
import com.team.backend.dto.TestDto;
import com.team.backend.service.TestAttemptService;
import com.team.backend.service.TestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@Tag(name = "Tests", description = "Gestion des tests techniques de recrutement")
public class TestController {

    private final TestService service;
    private final TestAttemptService attemptService;

    public TestController(TestService service, TestAttemptService attemptService) {
        this.service = service;
        this.attemptService = attemptService;
    }

    @GetMapping
    @Operation(summary = "Récupérer tous les tests")
    public ResponseEntity<ApiResponse<List<TestDto>>> getAll(@RequestParam(required = false) Long jobOfferId) {
        if (jobOfferId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Tests de l'offre d'emploi", service.findByJobOfferId(jobOfferId)));
        }
        return ResponseEntity.ok(ApiResponse.ok("Liste de tous les tests", service.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un test par son ID")
    public ResponseEntity<ApiResponse<TestDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Test trouvé", service.findById(id)));
    }

    @GetMapping("/job/{jobOfferId}")
    @Operation(summary = "Récupérer les tests associés à une offre d'emploi")
    public ResponseEntity<ApiResponse<List<TestDto>>> getByJobOfferId(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(ApiResponse.ok("Tests associés à l'offre", service.findByJobOfferId(jobOfferId)));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau test technique")
    public ResponseEntity<ApiResponse<TestDto>> create(@RequestBody TestDto dto) {
        TestDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Test technique créé avec succès", created));
    }

    @PostMapping("/submit")
    @Operation(summary = "Soumettre un test candidat (alias compatible frontend)")
    public ResponseEntity<ApiResponse<TestAttemptDto>> submitTest(@RequestBody TestAttemptDto dto) {
        TestAttemptDto submitted = attemptService.submitAttempt(dto);
        return ResponseEntity.ok(ApiResponse.ok("Test soumis avec succès", submitted));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un test par son ID")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Test supprimé avec succès", null));
    }
}
