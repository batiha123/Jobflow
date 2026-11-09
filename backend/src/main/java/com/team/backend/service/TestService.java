package com.team.backend.service;

import com.team.backend.dto.TestDto;
import com.team.backend.entity.Test;
import com.team.backend.repository.TestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestService {

    private final TestRepository repository;

    public TestService(TestRepository repository) {
        this.repository = repository;
    }

    public List<TestDto> findAll() {
        return repository.findAll()
                .stream()
                .map(TestDto::fromEntity)
                .collect(Collectors.toList());
    }

    public TestDto findById(Long id) {
        Test test = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test non trouvé avec l'id: " + id));
        return TestDto.fromEntity(test);
    }

    public List<TestDto> findByJobOfferId(Long jobOfferId) {
        return repository.findByJobOfferId(jobOfferId)
                .stream()
                .map(TestDto::fromEntity)
                .collect(Collectors.toList());
    }

    public TestDto create(TestDto dto) {
        if (dto.getJobOfferId() == null) {
            throw new IllegalArgumentException("jobOfferId est obligatoire pour créer un test.");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Le titre du test est obligatoire.");
        }

        Test test = dto.toEntity();
        if (test.getCreatedAt() == null) {
            test.setCreatedAt(LocalDateTime.now());
        }

        Test saved = repository.save(test);
        return TestDto.fromEntity(saved);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Test non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}
