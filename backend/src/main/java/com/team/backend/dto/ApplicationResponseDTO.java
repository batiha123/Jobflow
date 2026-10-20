package com.team.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ApplicationResponseDTO {

    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidateHeadline;
    private Long jobOfferId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String location;
    private String contractType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String status;
    private String motivationMessage;
    private String cvUrl;
    private LocalDateTime applicationDate;
    private InterviewDTO interview;
    private TestAttemptDTO testAttempt;

    public ApplicationResponseDTO() {
    }

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

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public String getCandidateHeadline() {
        return candidateHeadline;
    }

    public void setCandidateHeadline(String candidateHeadline) {
        this.candidateHeadline = candidateHeadline;
    }

    public Long getJobOfferId() {
        return jobOfferId;
    }

    public void setJobOfferId(Long jobOfferId) {
        this.jobOfferId = jobOfferId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyLogo() {
        return companyLogo;
    }

    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContractType() {
        return contractType;
    }

    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public InterviewDTO getInterview() {
        return interview;
    }

    public void setInterview(InterviewDTO interview) {
        this.interview = interview;
    }

    public TestAttemptDTO getTestAttempt() {
        return testAttempt;
    }

    public void setTestAttempt(TestAttemptDTO testAttempt) {
        this.testAttempt = testAttempt;
    }
}
