package com.team.backend.repository;

import com.team.backend.entity.JobOfferReport;
import com.team.backend.entity.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOfferReportRepository extends JpaRepository<JobOfferReport, Long> {

    List<JobOfferReport> findAllByOrderByReportDateDesc();

    List<JobOfferReport> findByStatusOrderByReportDateDesc(ReportStatus status);

    long countByStatus(ReportStatus status);
}
