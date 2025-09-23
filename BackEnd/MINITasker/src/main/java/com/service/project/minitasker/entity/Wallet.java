package com.service.project.minitasker.entity;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double balance = 0.0;

    private String type;

    // Inverse side
    @OneToOne(mappedBy = "wallet")
    @JsonManagedReference
    private User user;

    public void setUser(User user) {
        this.user = user;
        if (user.getWallet() != this) {
            user.setWallet(this);
        }
    }
}
