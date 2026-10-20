package com.team.backend.service;

import com.team.backend.dto.JobOfferDTO;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.entity.JobOffer;
import com.team.backend.entity.enums.JobStatus;
import com.team.backend.repository.CompanyProfileRepository;
import com.team.backend.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private JobOfferDTO toDTO(JobOffer offer) {
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
