package com.service.project.minitasker.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
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

    private boolean enabled;

    private Double walletBalance = 0.0;

    // User now owns the relationship
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id") // <-- foreign key in User table now
    @JsonBackReference
    private Wallet wallet;

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
        if (wallet.getUser() != this) {
            wallet.setUser(this);
        }
    }
}
