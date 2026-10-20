package com.team.backend.repository;

import com.team.backend.entity.JobOffer;
import com.team.backend.entity.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    List<JobOffer> findByStatusOrderByPublicationDateDesc(JobStatus status);

    List<JobOffer> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    @Query("SELECT j FROM JobOffer j WHERE j.status = 'PUBLISHED' " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "ORDER BY j.publicationDate DESC")
    List<JobOffer> searchPublishedOffers(@Param("keyword") String keyword, @Param("location") String location);
}
