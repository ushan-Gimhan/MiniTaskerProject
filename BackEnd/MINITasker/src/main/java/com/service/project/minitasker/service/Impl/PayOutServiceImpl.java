package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.entity.Payout;
import com.service.project.minitasker.repo.PayoutRepositiry;
import com.service.project.minitasker.service.PayOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayOutServiceImpl implements PayOutService {

    private final PayoutRepositiry payOutRepository;

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
        // Default status if not set
//        if (payout.getStatus() == null) {
//            payout.setStatus("PENDING");
//        }
        return payOutRepository.save(payout);
    }

    @Override
    public Payout updateStatus(Long id, String status) {
        Payout payout = getPayoutById(id);
//        payout.setStatus(status);
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
