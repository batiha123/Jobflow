package com.team.backend.service;

import com.team.backend.dto.TestAttemptDto;
import com.team.backend.entity.TestAttempt;
import com.team.backend.entity.enums.AttemptStatus;
import com.team.backend.repository.TestAttemptRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestAttemptService {

    private final TestAttemptRepository repository;

    public TestAttemptService(TestAttemptRepository repository) {
        this.repository = repository;
    }

    public List<TestAttemptDto> findAll() {
        return repository.findAll()
                .stream()
                .map(TestAttemptDto::fromEntity)
                .collect(Collectors.toList());
    }

    public TestAttemptDto findById(Long id) {
        TestAttempt attempt = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tentative de test non trouvée avec l'id: " + id));
        return TestAttemptDto.fromEntity(attempt);
    }

    public List<TestAttemptDto> findByTestId(Long testId) {
        return repository.findByTestId(testId)
                .stream()
                .map(TestAttemptDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TestAttemptDto> findByApplicationId(Long applicationId) {
        return repository.findByApplicationId(applicationId)
                .stream()
                .map(TestAttemptDto::fromEntity)
                .collect(Collectors.toList());
    }

    public TestAttemptDto startAttempt(Long testId, Long applicationId) {
        if (testId == null || applicationId == null) {
            throw new IllegalArgumentException("testId et applicationId sont obligatoires pour commencer un test.");
        }

        TestAttempt attempt = new TestAttempt(testId, applicationId);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.IN_PROGRESS);

        TestAttempt saved = repository.save(attempt);
        return TestAttemptDto.fromEntity(saved);
    }

    public TestAttemptDto submitAttempt(TestAttemptDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Les données de la tentative sont obligatoires.");
        }

        TestAttempt attempt;
        if (dto.getId() != null) {
            attempt = repository.findById(dto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Tentative non trouvée avec l'id: " + dto.getId()));
        } else {
            if (dto.getTestId() == null || dto.getApplicationId() == null) {
                throw new IllegalArgumentException("testId et applicationId sont requis pour soumettre un test.");
            }
            attempt = new TestAttempt(dto.getTestId(), dto.getApplicationId());
            attempt.setStartedAt(LocalDateTime.now());
        }

        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setScore(dto.getScore());
        attempt.setStatus(AttemptStatus.COMPLETED);

        TestAttempt saved = repository.save(attempt);
        return TestAttemptDto.fromEntity(saved);
    }

    public TestAttemptDto submitAttemptById(Long id, BigDecimal score) {
        TestAttempt attempt = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tentative non trouvée avec l'id: " + id));

        attempt.setScore(score);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.COMPLETED);

        TestAttempt saved = repository.save(attempt);
        return TestAttemptDto.fromEntity(saved);
    }
}
