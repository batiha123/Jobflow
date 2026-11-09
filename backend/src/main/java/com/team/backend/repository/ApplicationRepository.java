package com.team.backend.repository;

import com.team.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobOfferId(Long jobOfferId);
}
