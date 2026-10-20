package com.team.backend.repository;

import com.team.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA generates: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Spring Data JPA generates: SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);
}
