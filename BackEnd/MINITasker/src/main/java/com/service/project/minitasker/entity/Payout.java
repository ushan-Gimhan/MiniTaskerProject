package com.service.project.minitasker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "payouts")
public class Payout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    private Double amount;
    private String status; // PENDING, APPROVED, REJECTED
    private String requestedAt;
    private String processedAt;
}
