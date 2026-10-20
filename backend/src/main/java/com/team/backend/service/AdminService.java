package com.team.backend.service;

import com.team.backend.dto.PlatformStatsDTO;
import com.team.backend.dto.ReportDTO;
import com.team.backend.dto.UserSummaryDTO;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.entity.JobOffer;
import com.team.backend.entity.JobOfferReport;
import com.team.backend.entity.User;
import com.team.backend.entity.enums.AccountStatus;
import com.team.backend.entity.enums.JobStatus;
import com.team.backend.entity.enums.ReportStatus;
import com.team.backend.entity.enums.Role;
import com.team.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final JobOfferReportRepository jobOfferReportRepository;
    private final CompanyProfileRepository companyProfileRepository;

    public AdminService(UserRepository userRepository,
                        JobOfferRepository jobOfferRepository,
                        ApplicationRepository applicationRepository,
                        InterviewRepository interviewRepository,
                        JobOfferReportRepository jobOfferReportRepository,
                        CompanyProfileRepository companyProfileRepository) {
        this.userRepository = userRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.jobOfferReportRepository = jobOfferReportRepository;
        this.companyProfileRepository = companyProfileRepository;
    }

    @Transactional(readOnly = true)
    public PlatformStatsDTO getPlatformStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long candidateUsers = users.stream().filter(u -> u.getRole() == Role.CANDIDATE).count();
        long companyUsers = users.stream().filter(u -> u.getRole() == Role.COMPANY).count();

        long totalOffers = jobOfferRepository.count();
        long publishedOffers = jobOfferRepository.findByStatusOrderByPublicationDateDesc(JobStatus.PUBLISHED).size();
        long totalApplications = applicationRepository.count();
        long totalInterviews = interviewRepository.count();
        long pendingReports = jobOfferReportRepository.countByStatus(ReportStatus.PENDING);

        return new PlatformStatsDTO(
                totalUsers, candidateUsers, companyUsers,
                totalOffers, publishedOffers, totalApplications,
                totalInterviews, pendingReports
        );
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAllUsers() {
        return userRepository.findAll().stream().map(u -> new UserSummaryDTO(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getPhone(),
                u.getRole().name(),
                u.getAccountStatus().name(),
                u.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDTO updateUserStatus(Long userId, String statusStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        try {
            user.setAccountStatus(AccountStatus.valueOf(statusStr.toUpperCase()));
        } catch (Exception e) {
            throw new RuntimeException("Statut invalide : " + statusStr);
        }

        User updated = userRepository.save(user);
        return new UserSummaryDTO(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getPhone(),
                updated.getRole().name(),
                updated.getAccountStatus().name(),
                updated.getCreatedAt()
        );
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));
        userRepository.delete(user);
    }

    @Transactional
    public ReportDTO reportJobOffer(Long offerId, Long reporterUserId, String reason, String description) {
        JobOffer offer = jobOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre d'emploi introuvable."));

        JobOfferReport report = new JobOfferReport();
        report.setJobOfferId(offerId);
        report.setUserId(reporterUserId != null ? reporterUserId : 1L);
        report.setReason(reason != null ? reason : "Contenu inapproprié");
        report.setDescription(description != null ? description : "Signalement utilisateur");
        report.setStatus(ReportStatus.PENDING);

        JobOfferReport saved = jobOfferReportRepository.save(report);
        return toReportDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ReportDTO> getAllReports() {
        return jobOfferReportRepository.findAllByOrderByReportDateDesc()
                .stream().map(this::toReportDTO).collect(Collectors.toList());
    }

    @Transactional
    public ReportDTO resolveReport(Long reportId, String statusStr, boolean deleteOffer) {
        JobOfferReport report = jobOfferReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable."));

        try {
            report.setStatus(ReportStatus.valueOf(statusStr.toUpperCase()));
        } catch (Exception e) {
            report.setStatus(deleteOffer ? ReportStatus.ACTION_TAKEN : ReportStatus.REVIEWED);
        }

        if (deleteOffer) {
            jobOfferRepository.findById(report.getJobOfferId()).ifPresent(jobOfferRepository::delete);
        }

        JobOfferReport updated = jobOfferReportRepository.save(report);
        return toReportDTO(updated);
    }

    private ReportDTO toReportDTO(JobOfferReport r) {
        ReportDTO dto = new ReportDTO();
        dto.setId(r.getId());
        dto.setUserId(r.getUserId());
        dto.setJobOfferId(r.getJobOfferId());
        dto.setReason(r.getReason());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus().name());
        dto.setReportDate(r.getReportDate());

        userRepository.findById(r.getUserId()).ifPresent(u -> {
            dto.setUserName(u.getName());
            dto.setUserEmail(u.getEmail());
        });

        jobOfferRepository.findById(r.getJobOfferId()).ifPresent(job -> {
            dto.setJobOfferTitle(job.getTitle());
            companyProfileRepository.findById(job.getCompanyId()).ifPresent(comp -> {
                dto.setCompanyName(comp.getCompanyName());
            });
        });

        return dto;
    }
}
