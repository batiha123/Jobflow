package com.team.backend.dto;

import com.team.backend.entity.Interview;
import com.team.backend.entity.enums.InterviewStatus;

import java.time.LocalDateTime;

public class InterviewDto {

    private Long id;
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private String location;
    private String meetingUrl;
    private String notes;
    private InterviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InterviewDto() {}

    public static InterviewDto fromEntity(Interview interview) {
        if (interview == null) return null;
        InterviewDto dto = new InterviewDto();
        dto.setId(interview.getId());
        dto.setApplicationId(interview.getApplicationId());
        dto.setScheduledAt(interview.getScheduledAt());
        dto.setLocation(interview.getLocation());
        dto.setMeetingUrl(interview.getMeetingUrl());
        dto.setNotes(interview.getNotes());
        dto.setStatus(interview.getStatus());
        dto.setCreatedAt(interview.getCreatedAt());
        dto.setUpdatedAt(interview.getUpdatedAt());
        return dto;
    }

    public Interview toEntity() {
        Interview interview = new Interview();
        interview.setId(this.id);
        interview.setApplicationId(this.applicationId);
        interview.setScheduledAt(this.scheduledAt);
        interview.setLocation(this.location);
        interview.setMeetingUrl(this.meetingUrl);
        interview.setNotes(this.notes);
        if (this.status != null) {
            interview.setStatus(this.status);
        }
        return interview;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMeetingUrl() { return meetingUrl; }
    public void setMeetingUrl(String meetingUrl) { this.meetingUrl = meetingUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
