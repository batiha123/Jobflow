package com.team.backend.repository;

import com.team.backend.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Optional<TestAttempt> findByApplicationId(Long applicationId);

    List<TestAttempt> findByTestId(Long testId);
}
