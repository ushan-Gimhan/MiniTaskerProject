package com.service.project.minitasker.service;

import com.service.project.minitasker.entity.Payout;

import java.util.List;

public interface PayOutService {
    List<Payout> getAllPayouts();

    Payout getPayoutById(Long id);

    Payout createPayout(Payout payout);

    Payout updateStatus(Long id, String status);

    void deletePayout(Long id);

    List<Payout> getPayoutsByUser(Long userId);

}
