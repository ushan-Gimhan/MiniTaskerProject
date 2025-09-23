package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.Exeptions.InsufficientBalanceException;
import com.service.project.minitasker.entity.Notification;
import com.service.project.minitasker.entity.Payout;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.entity.Wallet;
import com.service.project.minitasker.repo.NotifyRepository;
import com.service.project.minitasker.repo.PayoutRepositiry;
import com.service.project.minitasker.repo.UserRepository;
import com.service.project.minitasker.repo.WalletRepository;
import com.service.project.minitasker.service.PayOutService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayOutServiceImpl implements PayOutService {

    private final PayoutRepositiry payOutRepository;

    private final WalletRepository walletRepository;

    private final UserRepository userRepository;

    private final NotifyRepository notifyRepository;

    @Override
    public List<Payout> getAllPayouts() {
        return payOutRepository.findAll();
    }

    @Override
    public Payout getPayoutById(Long id) {
        return payOutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payout not found with id: " + id));
    }

    @Override
    public Payout createPayout(Payout payout) {
        if (payout.getStatus() == null) {
            payout.setStatus("PENDING");
        }
        return payOutRepository.save(payout);
    }

    @Override
    @Transactional
    public Payout updateStatus(Long id, String status) {
        Payout payout = getPayoutById(id); // fetch existing payout
        String previousStatus = payout.getStatus();

        // Only process if status is actually changing
        if (status.equalsIgnoreCase(previousStatus)) {
            return payout; // nothing to do
        }

        // If approving payout, check wallet balance first
        if ("APPROVED".equalsIgnoreCase(status)) {
            User user = payout.getUser();

            Wallet wallet = user.getWallet();

            if (wallet.getBalance() < payout.getAmount()) {
                throw new InsufficientBalanceException("Insufficient wallet balance for payout.");
            }

            // Deduct amount
            wallet.setBalance(wallet.getBalance() - payout.getAmount());
            walletRepository.save(wallet);

            // Create notification
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage("Your payout of $" + payout.getAmount() + " has been approved and deducted from your wallet.");
            notification.setTimestamp(String.valueOf(LocalDateTime.now()));
            notifyRepository.save(notification);
        }

        // Update payout status
        payout.setStatus(status);
        return payOutRepository.save(payout);
    }

    @Override
    public void deletePayout(Long id) {
        Payout payout = getPayoutById(id);
        payOutRepository.delete(payout);
    }

    @Override
    public List<Payout> getPayoutsByUser(Long userId) {
        return payOutRepository.findByUserId(userId);
    }
}
