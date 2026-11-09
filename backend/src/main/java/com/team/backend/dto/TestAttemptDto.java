package com.team.backend.dto;

import com.team.backend.entity.TestAttempt;
import com.team.backend.entity.enums.AttemptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TestAttemptDto {

    private Long id;
    private Long testId;
    private Long applicationId;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private BigDecimal score;
    private AttemptStatus status;

    public TestAttemptDto() {}

    public static TestAttemptDto fromEntity(TestAttempt attempt) {
        if (attempt == null) return null;
        TestAttemptDto dto = new TestAttemptDto();
        dto.setId(attempt.getId());
        dto.setTestId(attempt.getTestId());
        dto.setApplicationId(attempt.getApplicationId());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setCompletedAt(attempt.getCompletedAt());
        dto.setScore(attempt.getScore());
        dto.setStatus(attempt.getStatus());
        return dto;
    }

    public TestAttempt toEntity() {
        TestAttempt attempt = new TestAttempt();
        attempt.setId(this.id);
        attempt.setTestId(this.testId);
        attempt.setApplicationId(this.applicationId);
        attempt.setStartedAt(this.startedAt);
        attempt.setCompletedAt(this.completedAt);
        attempt.setScore(this.score);
        if (this.status != null) {
            attempt.setStatus(this.status);
        }
        return attempt;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }
}
