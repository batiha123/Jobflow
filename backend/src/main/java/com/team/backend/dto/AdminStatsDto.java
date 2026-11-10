package com.team.backend.dto;

public class AdminStatsDto {

    private long totalUsers;
    private long activeJobOffers;
    private long totalApplications;
    private long pendingReports;

    public AdminStatsDto() {
    }

    public AdminStatsDto(long totalUsers, long activeJobOffers, long totalApplications, long pendingReports) {
        this.totalUsers = totalUsers;
        this.activeJobOffers = activeJobOffers;
        this.totalApplications = totalApplications;
        this.pendingReports = pendingReports;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveJobOffers() {
        return activeJobOffers;
    }

    public void setActiveJobOffers(long activeJobOffers) {
        this.activeJobOffers = activeJobOffers;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }
}