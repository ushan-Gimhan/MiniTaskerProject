package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.EmailConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailTokenRepository extends JpaRepository<EmailConfirmationToken, Long> {
    Optional<EmailConfirmationToken> findByToken(String token);
}
