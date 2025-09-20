package com.service.project.minitasker.service;

import com.service.project.minitasker.entity.Wallet;

public interface WalletService {
    Wallet getWalletByUserId(Long userId);

    Wallet addBalance(Long userId, double amount);

    Wallet deductBalance(Long userId, double amount);

    Wallet createWallet(Long userId);

    void deleteWallet(Long id);
}
