package com.team.backend.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.backend.dto.ApiResponse;
import com.team.backend.entity.JobOfferReport;
import com.team.backend.entity.enums.ReportStatus;
import com.team.backend.service.JobOfferReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
@Tag(name = "Job Offer Reports", description = "Endpoints for reporting fraudulent or inappropriate job offers and admin moderation")
@RestController
@RequestMapping("/api/reports")
public class JobOfferReportController {

    private final JobOfferReportService reportService;

    public JobOfferReportController(JobOfferReportService reportService) {
        this.reportService = reportService;
    }

    // 1. POST /api/reports — Submit a new report against a job offer
    @Operation(summary = "Submit a report against a job offer")
    @PostMapping
    public ResponseEntity<ApiResponse<JobOfferReport>> createReport(
            @RequestParam Long userId,
            @RequestParam Long jobOfferId,
            @RequestParam String reason,
            @RequestParam(required = false, defaultValue = "") String description) {
        JobOfferReport report = reportService.createReport(userId, jobOfferId, reason, description);
        return ResponseEntity.ok(ApiResponse.ok("Report submitted successfully", report));
    }

    // 2. GET /api/reports — Get all reports (or filter by status, e.g. /api/reports?status=PENDING)
    @Operation(summary = "Get all reports (optionally filter by status)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<JobOfferReport>>> getReports(
            @RequestParam(required = false) ReportStatus status) {
        List<JobOfferReport> reports;
        if (status != null) {
            reports = reportService.getReportsByStatus(status);
        } else {
            reports = reportService.getAllReports();
        }
        return ResponseEntity.ok(ApiResponse.ok("Reports fetched successfully", reports));
    }

    // 3. PATCH /api/reports/{id}/status — Admin updates report status (REVIEWED, DISMISSED)
    @Operation(summary = "Update report status (Admin moderation)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<JobOfferReport>> updateReportStatus(
            @PathVariable Long id,
            @RequestParam ReportStatus status) {
        JobOfferReport updated = reportService.updateReportStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Report status updated to " + status, updated));
    }

    // 4. GET /api/reports/pending-count — Get count of pending reports
    @Operation(summary = "Get count of pending reports for admin alerts")
    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        long count = reportService.getPendingCount();
        return ResponseEntity.ok(ApiResponse.ok("Pending count fetched", count));
    }
}