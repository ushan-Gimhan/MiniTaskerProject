package com.service.project.minitasker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Double rewardPerTask;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String imageName;
    private String status;
    private Double totalPrice;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;
}
