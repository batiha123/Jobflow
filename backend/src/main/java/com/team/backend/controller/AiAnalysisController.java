package com.team.backend.controller;

import com.team.backend.dto.AiAnalysisDto;
import com.team.backend.dto.ApiResponse;
import com.team.backend.service.AiAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AI Services", description = "Endpoints for AI-powered CV analysis and job matching")
@RestController
@RequestMapping("/api/ai")
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    public AiAnalysisController(AiAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @Operation(summary = "Analyze candidate CV against job requirements using Google Gemini AI")
    @PostMapping("/analyze-cv")
    public ResponseEntity<ApiResponse<AiAnalysisDto.Response>> analyzeCv(@RequestBody AiAnalysisDto.Request request) {
        AiAnalysisDto.Response response = aiAnalysisService.analyzeCv(request);
        return ResponseEntity.ok(ApiResponse.ok("CV analysis completed successfully", response));
    }
}