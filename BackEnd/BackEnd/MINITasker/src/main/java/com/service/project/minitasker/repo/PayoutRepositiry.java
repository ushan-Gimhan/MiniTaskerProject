package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Payout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayoutRepositiry extends JpaRepository<Payout, Long> {
    List<Payout> findByUserId(Long userId);
}
