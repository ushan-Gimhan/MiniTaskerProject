package com.service.project.minitasker.controller;


import com.service.project.minitasker.entity.Payment;
import com.service.project.minitasker.repo.PaymentRepository;
import com.service.project.minitasker.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentController {

    private final PaymentService paymentService;

    // ✅ Get all payments
    @GetMapping("/getAll")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.findAll();
        return ResponseEntity.ok(payments);
    }
}
