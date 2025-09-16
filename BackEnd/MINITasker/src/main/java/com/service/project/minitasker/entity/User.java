package com.service.project.minitasker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    private String mobile;

    @Enumerated(EnumType.STRING)
    private Role role; // WORKER, CLIENT, ADMIN

    private Double walletBalance = 0.0;

}