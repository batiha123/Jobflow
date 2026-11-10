package com.team.backend.service;

import com.team.backend.dto.InterviewDto;
import com.team.backend.entity.Interview;
import com.team.backend.entity.enums.InterviewStatus;
import com.team.backend.repository.InterviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository repository;

    public InterviewService(InterviewRepository repository) {
        this.repository = repository;
    }

    public List<InterviewDto> findAll() {
        return repository.findAll()
                .stream()
                .map(InterviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    public InterviewDto findById(Long id) {
        Interview interview = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entretien non trouvé avec l'id: " + id));
        return InterviewDto.fromEntity(interview);
    }

    public List<InterviewDto> findByApplicationId(Long applicationId) {
        return repository.findByApplicationId(applicationId)
                .stream()
                .map(InterviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    public InterviewDto schedule(InterviewDto dto) {
        if (dto.getApplicationId() == null) {
            throw new IllegalArgumentException("applicationId est obligatoire pour planifier un entretien.");
        }
        if (dto.getScheduledAt() == null) {
            throw new IllegalArgumentException("scheduledAt est obligatoire pour planifier un entretien.");
        }

        Interview interview = dto.toEntity();
        if (interview.getStatus() == null) {
            interview.setStatus(InterviewStatus.SCHEDULED);
        }
        if (interview.getCreatedAt() == null) {
            interview.setCreatedAt(LocalDateTime.now());
        }
        interview.setUpdatedAt(LocalDateTime.now());

        Interview saved = repository.save(interview);
        return InterviewDto.fromEntity(saved);
    }

    public InterviewDto updateStatus(Long id, InterviewStatus status) {
        Interview interview = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entretien non trouvé avec l'id: " + id));

        interview.setStatus(status);
        interview.setUpdatedAt(LocalDateTime.now());

        Interview updated = repository.save(interview);
        return InterviewDto.fromEntity(updated);
    }

    public InterviewDto update(Long id, InterviewDto dto) {
        Interview interview = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entretien non trouvé avec l'id: " + id));

        if (dto.getScheduledAt() != null) interview.setScheduledAt(dto.getScheduledAt());
        if (dto.getLocation() != null) interview.setLocation(dto.getLocation());
        if (dto.getMeetingUrl() != null) interview.setMeetingUrl(dto.getMeetingUrl());
        if (dto.getNotes() != null) interview.setNotes(dto.getNotes());
        if (dto.getStatus() != null) interview.setStatus(dto.getStatus());
        interview.setUpdatedAt(LocalDateTime.now());

        Interview updated = repository.save(interview);
        return InterviewDto.fromEntity(updated);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Entretien non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}
