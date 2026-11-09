package com.team.backend.service;

import com.team.backend.dto.JobOfferRequest;
import com.team.backend.dto.JobOfferResponse;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.entity.JobOffer;
import com.team.backend.entity.enums.ContractType;
import com.team.backend.entity.enums.JobStatus;
import com.team.backend.repository.ApplicationRepository;
import com.team.backend.repository.CompanyProfileRepository;
import com.team.backend.repository.JobOfferReportRepository;
import com.team.backend.repository.JobOfferRepository;
import com.team.backend.repository.JobOfferSpecifications;
import com.team.backend.repository.TestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final TestRepository testRepository;
    private final JobOfferReportRepository jobOfferReportRepository;
    private final CurrentUserProvider currentUserProvider;

    public JobOfferService(
            JobOfferRepository jobOfferRepository,
            CompanyProfileRepository companyProfileRepository,
            ApplicationRepository applicationRepository,
            TestRepository testRepository,
            JobOfferReportRepository jobOfferReportRepository,
            CurrentUserProvider currentUserProvider) {
        this.jobOfferRepository = jobOfferRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.applicationRepository = applicationRepository;
        this.testRepository = testRepository;
        this.jobOfferReportRepository = jobOfferReportRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public JobOfferResponse createOffer(JobOfferRequest request) {
        validateSalaryRange(request);
        CompanyProfile companyProfile = getCurrentCompanyProfile();

        JobOffer offer = new JobOffer();
        offer.setCompanyId(companyProfile.getId());
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setLocation(request.getLocation());
        offer.setContractType(request.getContractType());
        offer.setSalaryMin(request.getSalaryMin());
        offer.setSalaryMax(request.getSalaryMax());
        offer.setStatus(JobStatus.DRAFT);
        offer.setPublicationDate(null);

        return toResponse(jobOfferRepository.save(offer));
    }

    @Transactional(readOnly = true)
    public Page<JobOfferResponse> getMyOffers(Pageable pageable) {
        Long companyId = getCurrentCompanyProfile().getId();
        return jobOfferRepository.findAllByCompanyId(companyId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<JobOfferResponse> searchMyOffers(
            String title,
            String location,
            ContractType contractType,
            JobStatus status,
            Pageable pageable) {
        Long companyId = getCurrentCompanyProfile().getId();
        return jobOfferRepository.findAll(
                        JobOfferSpecifications.search(companyId, status, title, location, contractType),
                        pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public JobOfferResponse getMyOfferById(Long id) {
        return toResponse(getMyOffer(id));
    }

    @Transactional
    public JobOfferResponse updateMyOffer(Long id, JobOfferRequest request) {
        validateSalaryRange(request);
        JobOffer offer = getMyOffer(id);
        if (offer.getStatus() != JobStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only draft offers can be updated");
        }

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setLocation(request.getLocation());
        offer.setContractType(request.getContractType());
        offer.setSalaryMin(request.getSalaryMin());
        offer.setSalaryMax(request.getSalaryMax());

        return toResponse(jobOfferRepository.save(offer));
    }

    @Transactional
    public JobOfferResponse submitMyOffer(Long id) {
        JobOffer offer = getMyOffer(id);
        requireStatus(offer, JobStatus.DRAFT, "Only draft offers can be submitted");
        offer.setStatus(JobStatus.PENDING);
        return toResponse(jobOfferRepository.save(offer));
    }

    @Transactional
    public JobOfferResponse approveOffer(Long id) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> offerNotFound(id));
        requireStatus(offer, JobStatus.PENDING, "Only pending offers can be approved");
        offer.setStatus(JobStatus.PUBLISHED);
        offer.setPublicationDate(LocalDateTime.now());
        return toResponse(jobOfferRepository.save(offer));
    }

    @Transactional
    public JobOfferResponse rejectOffer(Long id) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> offerNotFound(id));
        requireStatus(offer, JobStatus.PENDING, "Only pending offers can be rejected");
        offer.setStatus(JobStatus.REJECTED);
        return toResponse(jobOfferRepository.save(offer));
    }

    @Transactional
    public JobOfferResponse closeMyOffer(Long id) {
        JobOffer offer = getMyOffer(id);
        requireStatus(offer, JobStatus.PUBLISHED, "Only published offers can be closed");
        offer.setStatus(JobStatus.CLOSED);
        return toResponse(jobOfferRepository.save(offer));
    }

    @Transactional
    public void deleteMyOffer(Long id) {
        JobOffer offer = getMyOffer(id);
        if (offer.getStatus() != JobStatus.DRAFT
                && offer.getStatus() != JobStatus.REJECTED
                && offer.getStatus() != JobStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Offer cannot be deleted in its current status");
        }

        Long offerId = offer.getId();
        if (applicationRepository.existsByJobOfferId(offerId)
                || testRepository.existsByJobOfferId(offerId)
                || jobOfferReportRepository.existsByJobOfferId(offerId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Offer has dependent applications, tests, or reports");
        }

        jobOfferRepository.delete(offer);
    }

    @Transactional(readOnly = true)
    public Page<JobOfferResponse> getPublicOffers(Pageable pageable) {
        return jobOfferRepository.findAllByStatus(JobStatus.PUBLISHED, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<JobOfferResponse> searchPublicOffers(
            String title,
            String location,
            ContractType contractType,
            Pageable pageable) {
        return jobOfferRepository.findAll(
                        JobOfferSpecifications.search(
                                null, JobStatus.PUBLISHED, title, location, contractType),
                        pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public JobOfferResponse getPublicOfferById(Long id) {
        JobOffer offer = jobOfferRepository.findByIdAndStatus(id, JobStatus.PUBLISHED)
                .orElseThrow(() -> offerNotFound(id));
        return toResponse(offer);
    }

    private CompanyProfile getCurrentCompanyProfile() {
        Long userId = currentUserProvider.getCurrentUserId();
        return companyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Company profile not found"));
    }

    private JobOffer getMyOffer(Long id) {
        Long companyId = getCurrentCompanyProfile().getId();
        return jobOfferRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> offerNotFound(id));
    }

    private void validateSalaryRange(JobOfferRequest request) {
        if (request.getSalaryMin() != null
                && request.getSalaryMax() != null
                && request.getSalaryMin().compareTo(request.getSalaryMax()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Minimum salary must not exceed maximum salary");
        }
    }

    private void requireStatus(JobOffer offer, JobStatus expectedStatus, String message) {
        if (offer.getStatus() != expectedStatus) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }
    }

    private ResponseStatusException offerNotFound(Long id) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Job offer not found: " + id);
    }

    private JobOfferResponse toResponse(JobOffer offer) {
        CompanyProfile companyProfile = companyProfileRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Company profile not found"));

        JobOfferResponse response = new JobOfferResponse();
        response.setId(offer.getId());
        response.setTitle(offer.getTitle());
        response.setDescription(offer.getDescription());
        response.setLocation(offer.getLocation());
        response.setContractType(offer.getContractType());
        response.setSalaryMin(offer.getSalaryMin());
        response.setSalaryMax(offer.getSalaryMax());
        response.setStatus(offer.getStatus());
        response.setPublicationDate(offer.getPublicationDate());
        response.setCreatedAt(offer.getCreatedAt());
        response.setUpdatedAt(offer.getUpdatedAt());
        response.setCompanyName(companyProfile.getCompanyName());
        response.setCompanyLogoUrl(companyProfile.getLogoUrl());
        return response;
    }
}
