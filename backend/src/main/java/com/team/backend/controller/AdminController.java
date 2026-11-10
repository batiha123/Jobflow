package com.team.backend.controller;

import com.team.backend.dto.AdminStatsDto;
import com.team.backend.dto.ApiResponse;
import com.team.backend.entity.AdminAuditLog;
import com.team.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin", description = "Endpoints for platform supervision, statistics, and audit logs")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1. GET /api/admin/stats — Dashboard metrics
    @Operation(summary = "Get platform overview statistics")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getPlatformStats() {
        AdminStatsDto stats = adminService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.ok("Platform statistics fetched successfully", stats));
    }

    // 2. GET /api/admin/audit-logs — Audit trail of administrative actions
    @Operation(summary = "Get all admin audit logs")
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AdminAuditLog>>> getAuditLogs() {
        List<AdminAuditLog> logs = adminService.getAllAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok("Audit logs fetched successfully", logs));
    }

    // 3. POST /api/admin/audit-logs — Record an admin action
    @Operation(summary = "Record an admin action in the audit log")
    @PostMapping("/audit-logs")
    public ResponseEntity<ApiResponse<AdminAuditLog>> logAction(
            @RequestParam Long adminUserId,
            @RequestParam String action,
            @RequestParam String targetType,
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false, defaultValue = "") String details) {
        AdminAuditLog log = adminService.logAction(adminUserId, action, targetType, targetId, details);
        return ResponseEntity.ok(ApiResponse.ok("Admin action logged successfully", log));
    }
}