package com.service.project.minitasker.controller;


import com.service.project.minitasker.dto.ApiResponse;
import com.service.project.minitasker.entity.Payout;
import com.service.project.minitasker.service.PayOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payouts")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PayOutController {

    private final PayOutService payOutService;

    // --------------------- Get all payouts ---------------------
    @GetMapping
    public ResponseEntity<List<Payout>> getAllPayouts() {
        List<Payout> payouts = payOutService.getAllPayouts();
        return ResponseEntity.ok(payouts);
    }

    // --------------------- Get payout by ID ---------------------
    @GetMapping("/{id}")
    public ResponseEntity<Payout> getPayoutById(@PathVariable Long id) {
        Payout payout = payOutService.getPayoutById(id);
        return ResponseEntity.ok(payout);
    }

    // --------------------- Create a new payout request ---------------------
    @PostMapping
    public ResponseEntity<ApiResponse> createPayout(@RequestBody Payout payout) {
        Payout created = payOutService.createPayout(payout);
        return ResponseEntity.ok(new ApiResponse(200, "Payout request created successfully", created));
    }

    // --------------------- Update payout status ---------------------
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updatePayoutStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Payout updated = payOutService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(200, "Payout status updated successfully", updated));
    }

    // --------------------- Delete payout ---------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deletePayout(@PathVariable Long id) {
        payOutService.deletePayout(id);
        return ResponseEntity.ok(new ApiResponse(200, "Payout deleted successfully",""));
    }

    // --------------------- Get payouts by user ---------------------
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payout>> getPayoutsByUser(@PathVariable Long userId) {
        List<Payout> payouts = payOutService.getPayoutsByUser(userId);
        return ResponseEntity.ok(payouts);
    }

}
