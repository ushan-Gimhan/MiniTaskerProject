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
    @Transactional
    public Payout createPayout(Payout payout) {
        if (payout.getStatus() == null) {
            payout.setStatus("PENDING");
        }

        User user = payout.getUser();

        // Check if user has enough wallet balance
        if (user.getWalletBalance() < payout.getAmount()) {
            throw new InsufficientBalanceException(
                    "Insufficient wallet balance to create payout."
            );
        }

        // Deduct balance from user's walletBalance field
        user.setWalletBalance(user.getWalletBalance() - payout.getAmount());

        // Save user to persist the updated walletBalance
        userRepository.save(user);

        // Save the payout itself
        return payOutRepository.save(payout);
    }



    @Override
    public Payout updateStatus(Long id, String status) {
        Payout payout = getPayoutById(id); // fetch existing payout
        String previousStatus = payout.getStatus();

        // Only process if status is actually changing
        if (status.equalsIgnoreCase(previousStatus)) {
            return payout; // nothing to do
        }

        // ✅ Just update the status without touching wallet or notifications
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
