package com.service.project.minitasker.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "submissions")
@Data
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User user;

    private String proofUrl;  // file link / screenshot path
    private String status;    // PENDING, APPROVED, REJECTED
    private String reviewComment;
    private String description;


}

