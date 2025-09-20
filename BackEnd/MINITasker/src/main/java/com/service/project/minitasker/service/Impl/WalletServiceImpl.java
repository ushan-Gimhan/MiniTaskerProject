package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.entity.Wallet;
import com.service.project.minitasker.repo.WalletRepository;
import com.service.project.minitasker.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    @Override
    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user id: " + userId));
    }

    @Override
    public Wallet addBalance(Long userId, double amount) {
        Wallet wallet = getWalletByUserId(userId);
        wallet.setAmount(wallet.getAmount() + amount);
        return walletRepository.save(wallet);
    }

    @Override
    public Wallet deductBalance(Long userId, double amount) {
        Wallet wallet = getWalletByUserId(userId);
        if (wallet.getAmount() < amount) {
            throw new RuntimeException("Insufficient balance");
        }
        wallet.setAmount(wallet.getAmount() - amount);
        return walletRepository.save(wallet);
    }

    @Override
    public Wallet createWallet(Long userId) {
        Wallet wallet = new Wallet();
        wallet.setAmount(0.0);
        return walletRepository.save(wallet);
    }

    @Override
    public void deleteWallet(Long id) {
        walletRepository.deleteById(id);
    }
}
