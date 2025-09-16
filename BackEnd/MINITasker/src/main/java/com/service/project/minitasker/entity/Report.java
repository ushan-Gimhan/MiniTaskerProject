package com.service.project.minitasker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // COMPLAINT, SYSTEM, PERFORMANCE
    private String details;
    private String createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // who reported
}

