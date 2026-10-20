package com.team.backend.entity;

import com.team.backend.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(name = "uq_candidate_job", columnNames = {"candidate_id", "job_offer_id"})
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_offer_id", nullable = false)
    private Long jobOfferId;

    @Column(name = "cv_url", length = 500)
    private String cvUrl;

    @Column(name = "motivation_message", columnDefinition = "TEXT")
    private String motivationMessage;

    @Column(name = "application_date", nullable = false, updatable = false)
    private LocalDateTime applicationDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    public Application() {
    }

    public Application(Long candidateId, Long jobOfferId, String cvUrl, String motivationMessage) {
        this.candidateId = candidateId;
        this.jobOfferId = jobOfferId;
        this.cvUrl = cvUrl;
        this.motivationMessage = motivationMessage;
        this.status = ApplicationStatus.SUBMITTED;
        this.applicationDate = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.applicationDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public Long getJobOfferId() {
        return jobOfferId;
    }

    public void setJobOfferId(Long jobOfferId) {
        this.jobOfferId = jobOfferId;
    }

    public String getCvUrl() {
        return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }

    public String getMotivationMessage() {
        return motivationMessage;
    }

    public void setMotivationMessage(String motivationMessage) {
        this.motivationMessage = motivationMessage;
    }

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}
