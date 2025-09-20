package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
