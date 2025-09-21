package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.entity.Payment;
import com.service.project.minitasker.repo.PaymentRepository;
import com.service.project.minitasker.service.PaymentService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    @Override
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }
}
