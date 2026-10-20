package com.team.backend.service;

import com.team.backend.dto.JobOfferDTO;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.entity.JobOffer;
import com.team.backend.entity.enums.ContractType;
import com.team.backend.entity.enums.JobStatus;
import com.team.backend.repository.CompanyProfileRepository;
import com.team.backend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobOfferService {

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Transactional(readOnly = true)
    public List<JobOfferDTO> getPublishedOffers(String keyword, String location, String contractType) {
        List<JobOffer> offers;
        if ((keyword != null && !keyword.trim().isEmpty()) || (location != null && !location.trim().isEmpty())) {
            offers = jobOfferRepository.searchPublishedOffers(
                    (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                    (location != null && !location.trim().isEmpty()) ? location.trim() : null
            );
        } else {
            offers = jobOfferRepository.findByStatusOrderByPublicationDateDesc(JobStatus.PUBLISHED);
        }

        if (contractType != null && !contractType.trim().isEmpty() && !contractType.equalsIgnoreCase("ALL")) {
            offers = offers.stream()
                    .filter(o -> o.getContractType().name().equalsIgnoreCase(contractType.trim()))
                    .collect(Collectors.toList());
        }

        return offers.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobOfferDTO getOfferById(Long id) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre d'emploi introuvable avec l'id : " + id));
        return toDTO(offer);
    }

    @Transactional(readOnly = true)
    public List<JobOfferDTO> getCompanyOffers(Long companyUserId) {
        Optional<CompanyProfile> compOpt = companyProfileRepository.findByUserId(companyUserId);
        if (compOpt.isEmpty()) {
            return Collections.emptyList();
        }

        List<JobOffer> offers = jobOfferRepository.findByCompanyIdOrderByCreatedAtDesc(compOpt.get().getId());
        return offers.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public JobOfferDTO createOffer(Long companyUserId, JobOfferDTO dto) {
        CompanyProfile company = companyProfileRepository.findByUserId(companyUserId)
                .orElseGet(() -> {
                    CompanyProfile newProf = new CompanyProfile();
                    newProf.setUserId(companyUserId);
                    newProf.setCompanyName("Mon Entreprise");
                    return companyProfileRepository.save(newProf);
                });

        JobOffer offer = new JobOffer();
        offer.setCompanyId(company.getId());
        offer.setTitle(dto.getTitle());
        offer.setDescription(dto.getDescription());
        offer.setLocation(dto.getLocation());

        if (dto.getContractType() != null) {
            try {
                offer.setContractType(ContractType.valueOf(dto.getContractType().toUpperCase()));
            } catch (Exception e) {
                offer.setContractType(ContractType.FULL_TIME);
            }
        }

        offer.setSalaryMin(dto.getSalaryMin());
        offer.setSalaryMax(dto.getSalaryMax());
        offer.setStatus(JobStatus.PUBLISHED);
        offer.setPublicationDate(LocalDateTime.now());

        JobOffer saved = jobOfferRepository.save(offer);
        return toDTO(saved);
    }

    @Transactional
    public JobOfferDTO updateOffer(Long offerId, Long companyUserId, JobOfferDTO dto) {
        JobOffer offer = jobOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre d'emploi introuvable."));

        if (companyUserId != null) {
            CompanyProfile company = companyProfileRepository.findByUserId(companyUserId)
                    .orElseThrow(() -> new RuntimeException("Profil entreprise introuvable."));
            if (!offer.getCompanyId().equals(company.getId())) {
                throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette offre.");
            }
        }

        if (dto.getTitle() != null) offer.setTitle(dto.getTitle());
        if (dto.getDescription() != null) offer.setDescription(dto.getDescription());
        if (dto.getLocation() != null) offer.setLocation(dto.getLocation());

        if (dto.getContractType() != null) {
            try {
                offer.setContractType(ContractType.valueOf(dto.getContractType().toUpperCase()));
            } catch (Exception e) {
                // Keep existing
            }
        }

        if (dto.getSalaryMin() != null) offer.setSalaryMin(dto.getSalaryMin());
        if (dto.getSalaryMax() != null) offer.setSalaryMax(dto.getSalaryMax());

        if (dto.getStatus() != null) {
            try {
                offer.setStatus(JobStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (Exception e) {
                // Keep existing
            }
        }

        JobOffer updated = jobOfferRepository.save(offer);
        return toDTO(updated);
    }

    @Transactional
    public void deleteOffer(Long offerId, Long companyUserId) {
        JobOffer offer = jobOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre d'emploi introuvable."));

        if (companyUserId != null) {
            CompanyProfile company = companyProfileRepository.findByUserId(companyUserId)
                    .orElseThrow(() -> new RuntimeException("Profil entreprise introuvable."));
            if (!offer.getCompanyId().equals(company.getId())) {
                throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette offre.");
            }
        }

        jobOfferRepository.delete(offer);
    }

    public JobOfferDTO toDTO(JobOffer offer) {
        JobOfferDTO dto = new JobOfferDTO();
        dto.setId(offer.getId());
        dto.setCompanyId(offer.getCompanyId());
        dto.setTitle(offer.getTitle());
        dto.setDescription(offer.getDescription());
        dto.setLocation(offer.getLocation());
        dto.setContractType(offer.getContractType().name());
        dto.setSalaryMin(offer.getSalaryMin());
        dto.setSalaryMax(offer.getSalaryMax());
        dto.setStatus(offer.getStatus().name());
        dto.setPublicationDate(offer.getPublicationDate());

        // Find associated company profile
        Optional<CompanyProfile> compOpt = companyProfileRepository.findById(offer.getCompanyId());
        if (compOpt.isPresent()) {
            dto.setCompanyName(compOpt.get().getCompanyName());
            dto.setCompanyLogo(compOpt.get().getLogoUrl());
        } else {
            dto.setCompanyName("Entreprise Partenaire");
            dto.setCompanyLogo("");
        }

        return dto;
    }
}
