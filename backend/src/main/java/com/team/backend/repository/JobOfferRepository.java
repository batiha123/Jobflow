package com.team.backend.repository;

import com.team.backend.entity.JobOffer;
import com.team.backend.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long>, JpaSpecificationExecutor<JobOffer> {

    Page<JobOffer> findAllByCompanyId(Long companyId, Pageable pageable);

    Optional<JobOffer> findByIdAndCompanyId(Long id, Long companyId);

    boolean existsByIdAndCompanyId(Long id, Long companyId);

    Page<JobOffer> findAllByStatus(JobStatus status, Pageable pageable);

    Optional<JobOffer> findByIdAndStatus(Long id, JobStatus status);
}
