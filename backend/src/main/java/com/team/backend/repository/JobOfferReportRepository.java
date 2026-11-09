package com.team.backend.repository;

import com.team.backend.entity.JobOfferReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobOfferReportRepository extends JpaRepository<JobOfferReport, Long> {

    boolean existsByJobOfferId(Long jobOfferId);
}
