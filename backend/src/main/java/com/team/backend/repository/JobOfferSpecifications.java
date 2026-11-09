package com.team.backend.repository;

import com.team.backend.entity.JobOffer;
import com.team.backend.entity.enums.ContractType;
import com.team.backend.entity.enums.JobStatus;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class JobOfferSpecifications {

    private JobOfferSpecifications() {
    }

    public static Specification<JobOffer> search(
            Long companyId,
            JobStatus status,
            String title,
            String location,
            ContractType contractType) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (companyId != null) {
                predicates.add(criteriaBuilder.equal(root.get("companyId"), companyId));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (title != null && !title.isBlank()) {
                String titlePattern = "%" + title.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.<String>get("title")), titlePattern));
            }
            if (location != null && !location.isBlank()) {
                String locationPattern = "%" + location.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.<String>get("location")), locationPattern));
            }
            if (contractType != null) {
                predicates.add(criteriaBuilder.equal(root.get("contractType"), contractType));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
