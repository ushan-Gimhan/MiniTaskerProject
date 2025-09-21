package com.service.project.minitasker.service;

import com.service.project.minitasker.entity.Payment;

import java.util.List;

public interface PaymentService {
    List<Payment> findAll();
}
