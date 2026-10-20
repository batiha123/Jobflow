package com.team.backend.dto;

public class ApplyRequest {

    private Long userId;
    private Long jobOfferId;
    private String motivationMessage;
    private String cvUrl;

    public ApplyRequest() {
    }

    public ApplyRequest(Long userId, Long jobOfferId, String motivationMessage, String cvUrl) {
        this.userId = userId;
        this.jobOfferId = jobOfferId;
        this.motivationMessage = motivationMessage;
        this.cvUrl = cvUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getJobOfferId() {
        return jobOfferId;
    }

    public void setJobOfferId(Long jobOfferId) {
        this.jobOfferId = jobOfferId;
    }

    public String getMotivationMessage() {
        return motivationMessage;
    }

    public void setMotivationMessage(String motivationMessage) {
        this.motivationMessage = motivationMessage;
    }

    public String getCvUrl() {
        return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }
}
