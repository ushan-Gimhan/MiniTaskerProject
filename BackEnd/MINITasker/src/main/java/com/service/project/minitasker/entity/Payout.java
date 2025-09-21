package com.service.project.minitasker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payouts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User user;

    private Double amount;
    private String status; // PENDING, APPROVED, REJECTED
    private String accountNumber;
    private String accountHolderName;
    private String requestedAt;
    private String processedAt;
}
