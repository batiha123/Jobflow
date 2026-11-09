package com.team.backend.dto;

import com.team.backend.entity.Application;
import com.team.backend.entity.enums.ApplicationStatus;

import java.time.LocalDateTime;

public class ApplicationDto {

    private Long id;
    private Long candidateId;
    private Long jobOfferId;
    private String cvUrl;
    private String motivationMessage;
    private LocalDateTime applicationDate;
    private ApplicationStatus status;

    public ApplicationDto() {}

    public ApplicationDto(Long candidateId, Long jobOfferId, String cvUrl, String motivationMessage) {
        this.candidateId = candidateId;
        this.jobOfferId = jobOfferId;
        this.cvUrl = cvUrl;
        this.motivationMessage = motivationMessage;
        this.status = ApplicationStatus.SUBMITTED;
    }

    // ─── Static factory from entity ──────────────────────────────────────────
    public static ApplicationDto fromEntity(Application app) {
        if (app == null) return null;
        ApplicationDto dto = new ApplicationDto();
        dto.setId(app.getId());
        dto.setCandidateId(app.getCandidateId());
        dto.setJobOfferId(app.getJobOfferId());
        dto.setCvUrl(app.getCvUrl());
        dto.setMotivationMessage(app.getMotivationMessage());
        dto.setApplicationDate(app.getApplicationDate());
        dto.setStatus(app.getStatus());
        return dto;
    }

    public Application toEntity() {
        Application app = new Application();
        app.setId(this.id);
        app.setCandidateId(this.candidateId);
        app.setJobOfferId(this.jobOfferId);
        app.setCvUrl(this.cvUrl);
        app.setMotivationMessage(this.motivationMessage);
        if (this.applicationDate != null) {
            app.setApplicationDate(this.applicationDate);
        }
        if (this.status != null) {
            app.setStatus(this.status);
        }
        return app;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobOfferId() { return jobOfferId; }
    public void setJobOfferId(Long jobOfferId) { this.jobOfferId = jobOfferId; }

    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }

    public String getMotivationMessage() { return motivationMessage; }
    public void setMotivationMessage(String motivationMessage) { this.motivationMessage = motivationMessage; }

    public LocalDateTime getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
}
