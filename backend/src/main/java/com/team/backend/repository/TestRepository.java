package com.team.backend.repository;

import com.team.backend.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Test, Long> {

    boolean existsByJobOfferId(Long jobOfferId);
}
