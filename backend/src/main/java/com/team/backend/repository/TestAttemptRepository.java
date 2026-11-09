package com.team.backend.repository;

import com.team.backend.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    List<TestAttempt> findByTestId(Long testId);

    List<TestAttempt> findByApplicationId(Long applicationId);
}
