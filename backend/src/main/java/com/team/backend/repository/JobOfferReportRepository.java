package com.team.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.backend.entity.JobOfferReport;
import com.team.backend.entity.enums.ReportStatus;

@Repository
public interface JobOfferReportRepository extends JpaRepository<JobOfferReport, Long> {

    List<JobOfferReport> findAllByOrderByReportDateDesc();

    List<JobOfferReport> findByStatusOrderByReportDateDesc(ReportStatus status);

    long countByStatus(ReportStatus status);
}