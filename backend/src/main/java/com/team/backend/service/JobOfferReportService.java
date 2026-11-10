package com.team.backend.service;

import com.team.backend.entity.JobOfferReport;
import com.team.backend.entity.enums.ReportStatus;
import com.team.backend.repository.JobOfferReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobOfferReportService {

    private final JobOfferReportRepository reportRepository;

    public JobOfferReportService(JobOfferReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // 1. Submit a new report (e.g. candidate flags a job offer)
    @Transactional
    public JobOfferReport createReport(Long userId, Long jobOfferId, String reason, String description) {
        JobOfferReport report = new JobOfferReport(userId, jobOfferId, reason, description);
        return reportRepository.save(report);
    }

    // 2. Get all reports (for Admin moderation panel)
    public List<JobOfferReport> getAllReports() {
        return reportRepository.findAllByOrderByReportDateDesc();
    }

    // 3. Filter reports by status (PENDING, REVIEWED, DISMISSED)
    public List<JobOfferReport> getReportsByStatus(ReportStatus status) {
        return reportRepository.findByStatusOrderByReportDateDesc(status);
    }

    // 4. Update status (Admin decides to dismiss or mark as reviewed)
    @Transactional
    public JobOfferReport updateReportStatus(Long reportId, ReportStatus newStatus) {
        JobOfferReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + reportId));
        report.setStatus(newStatus);
        return reportRepository.save(report);
    }

    // 5. Get count of pending reports (for the admin stats badge)
    public long getPendingCount() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }
}