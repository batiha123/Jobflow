package com.team.backend.service;

import com.team.backend.dto.TestAttemptDTO;
import com.team.backend.dto.TestDTO;
import com.team.backend.entity.Test;
import com.team.backend.entity.TestAttempt;
import com.team.backend.entity.enums.AttemptStatus;
import com.team.backend.repository.TestAttemptRepository;
import com.team.backend.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private TestAttemptRepository testAttemptRepository;

    @Transactional(readOnly = true)
    public List<TestDTO> getAllTests() {
        return testRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestDTO> getTestsForJob(Long jobOfferId) {
        return testRepository.findByJobOfferId(jobOfferId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TestAttemptDTO submitAttempt(Long testId, Long applicationId, BigDecimal score) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test introuvable"));

        TestAttempt attempt = testAttemptRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    TestAttempt newAtt = new TestAttempt();
                    newAtt.setTestId(testId);
                    newAtt.setApplicationId(applicationId);
                    newAtt.setStartedAt(LocalDateTime.now().minusMinutes(20));
                    return newAtt;
                });

        attempt.setScore(score);
        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        TestAttempt saved = testAttemptRepository.save(attempt);

        TestAttemptDTO dto = new TestAttemptDTO();
        dto.setId(saved.getId());
        dto.setTestId(saved.getTestId());
        dto.setTestTitle(test.getTitle());
        dto.setScore(saved.getScore());
        dto.setStatus(saved.getStatus().name());
        dto.setCompletedAt(saved.getCompletedAt());

        return dto;
    }

    private TestDTO toDTO(Test t) {
        TestDTO dto = new TestDTO();
        dto.setId(t.getId());
        dto.setJobOfferId(t.getJobOfferId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setDurationMinutes(t.getDurationMinutes());
        dto.setPassingScore(t.getPassingScore());
        return dto;
    }
}
