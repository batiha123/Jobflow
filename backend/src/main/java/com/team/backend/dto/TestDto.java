package com.team.backend.dto;

import com.team.backend.entity.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TestDto {

    private Long id;
    private Long jobOfferId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private BigDecimal passingScore;
    private LocalDateTime createdAt;

    public TestDto() {}

    public static TestDto fromEntity(Test test) {
        if (test == null) return null;
        TestDto dto = new TestDto();
        dto.setId(test.getId());
        dto.setJobOfferId(test.getJobOfferId());
        dto.setTitle(test.getTitle());
        dto.setDescription(test.getDescription());
        dto.setDurationMinutes(test.getDurationMinutes());
        dto.setPassingScore(test.getPassingScore());
        dto.setCreatedAt(test.getCreatedAt());
        return dto;
    }

    public Test toEntity() {
        Test test = new Test();
        test.setId(this.id);
        test.setJobOfferId(this.jobOfferId);
        test.setTitle(this.title);
        test.setDescription(this.description);
        test.setDurationMinutes(this.durationMinutes);
        test.setPassingScore(this.passingScore);
        if (this.createdAt != null) {
            test.setCreatedAt(this.createdAt);
        }
        return test;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobOfferId() { return jobOfferId; }
    public void setJobOfferId(Long jobOfferId) { this.jobOfferId = jobOfferId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getPassingScore() { return passingScore; }
    public void setPassingScore(BigDecimal passingScore) { this.passingScore = passingScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
