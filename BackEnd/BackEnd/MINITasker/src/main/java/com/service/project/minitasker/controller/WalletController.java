package com.service.project.minitasker.controller;


import com.service.project.minitasker.entity.Wallet;
import com.service.project.minitasker.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@CrossOrigin("*")
public class WalletController {

    private final WalletService walletService;

    // Get wallet by userId
    @GetMapping("/{userId}")
    public ResponseEntity<Wallet> getWallet(@PathVariable Long userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(wallet);
    }

    // Add balance
    @PostMapping("/add")
    public ResponseEntity<Wallet> addBalance(@RequestParam Long userId, @RequestParam double amount) {
        Wallet wallet = walletService.addBalance(userId, amount);
        return ResponseEntity.ok(wallet);
    }

    // Deduct balance
    @PostMapping("/deduct")
    public ResponseEntity<Wallet> deductBalance(@RequestParam Long userId, @RequestParam double amount) {
        Wallet wallet = walletService.deductBalance(userId, amount);
        return ResponseEntity.ok(wallet);
    }

    // Create wallet for user
    @PostMapping("/create")
    public ResponseEntity<Wallet> createWallet(@RequestParam Long userId) {
        Wallet wallet = walletService.createWallet(userId);
        return ResponseEntity.ok(wallet);
    }

    // Delete wallet
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWallet(@PathVariable Long id) {
        walletService.deleteWallet(id);
        return ResponseEntity.ok("Wallet deleted successfully");
    }
}
