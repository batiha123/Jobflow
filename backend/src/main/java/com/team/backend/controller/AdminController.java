package com.team.backend.controller;

import com.team.backend.dto.PlatformStatsDTO;
import com.team.backend.dto.ReportDTO;
import com.team.backend.dto.UserSummaryDTO;
import com.team.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserSummaryDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, status));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès."));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PostMapping("/reports/submit")
    public ResponseEntity<ReportDTO> reportJobOffer(
            @RequestParam Long offerId,
            @RequestParam(required = false) Long userId,
            @RequestParam String reason,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(adminService.reportJobOffer(offerId, userId, reason, description));
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportDTO> resolveReport(
            @PathVariable Long id,
            @RequestParam(defaultValue = "RESOLVED") String status,
            @RequestParam(defaultValue = "false") boolean deleteOffer) {
        return ResponseEntity.ok(adminService.resolveReport(id, status, deleteOffer));
    }
}
