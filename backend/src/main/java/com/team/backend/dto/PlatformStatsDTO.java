package com.team.backend.dto;

public class PlatformStatsDTO {

    private long totalUsers;
    private long candidateUsers;
    private long companyUsers;
    private long totalOffers;
    private long publishedOffers;
    private long totalApplications;
    private long totalInterviews;
    private long pendingReports;

    public PlatformStatsDTO() {
    }

    public PlatformStatsDTO(long totalUsers, long candidateUsers, long companyUsers, 
                            long totalOffers, long publishedOffers, long totalApplications, 
                            long totalInterviews, long pendingReports) {
        this.totalUsers = totalUsers;
        this.candidateUsers = candidateUsers;
        this.companyUsers = companyUsers;
        this.totalOffers = totalOffers;
        this.publishedOffers = publishedOffers;
        this.totalApplications = totalApplications;
        this.totalInterviews = totalInterviews;
        this.pendingReports = pendingReports;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getCandidateUsers() {
        return candidateUsers;
    }

    public void setCandidateUsers(long candidateUsers) {
        this.candidateUsers = candidateUsers;
    }

    public long getCompanyUsers() {
        return companyUsers;
    }

    public void setCompanyUsers(long companyUsers) {
        this.companyUsers = companyUsers;
    }

    public long getTotalOffers() {
        return totalOffers;
    }

    public void setTotalOffers(long totalOffers) {
        this.totalOffers = totalOffers;
    }

    public long getPublishedOffers() {
        return publishedOffers;
    }

    public void setPublishedOffers(long publishedOffers) {
        this.publishedOffers = publishedOffers;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(long totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }
}
