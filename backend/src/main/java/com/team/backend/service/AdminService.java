package com.team.backend.service;

import com.team.backend.dto.AdminStatsDto;
import com.team.backend.entity.AdminAuditLog;
import com.team.backend.entity.enums.JobStatus;
import com.team.backend.entity.enums.ReportStatus;
import com.team.backend.repository.AdminAuditLogRepository;
import com.team.backend.repository.JobOfferReportRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final AdminAuditLogRepository auditLogRepository;
    private final JobOfferReportRepository reportRepository;
    private final EntityManager entityManager;

    public AdminService(AdminAuditLogRepository auditLogRepository,
                        JobOfferReportRepository reportRepository,
                        EntityManager entityManager) {
        this.auditLogRepository = auditLogRepository;
        this.reportRepository = reportRepository;
        this.entityManager = entityManager;
    }

    // 1. Calculate dashboard statistics
    public AdminStatsDto getPlatformStats() {
        long totalUsers = entityManager.createQuery("SELECT COUNT(u) FROM User u", Long.class)
                .getSingleResult();

        long activeJobs = entityManager.createQuery("SELECT COUNT(j) FROM JobOffer j WHERE j.status = :status", Long.class)
                .setParameter("status", JobStatus.PUBLISHED)
                .getSingleResult();

        long totalApplications = entityManager.createQuery("SELECT COUNT(a) FROM Application a", Long.class)
                .getSingleResult();

        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);

        return new AdminStatsDto(totalUsers, activeJobs, totalApplications, pendingReports);
    }

    // 2. Fetch all audit logs
    public List<AdminAuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    // 3. Log an admin action
    @Transactional
    public AdminAuditLog logAction(Long adminUserId, String action, String targetType, Long targetId, String details) {
        AdminAuditLog log = new AdminAuditLog(adminUserId, action, targetType, targetId, details);
        return auditLogRepository.save(log);
    }
}
