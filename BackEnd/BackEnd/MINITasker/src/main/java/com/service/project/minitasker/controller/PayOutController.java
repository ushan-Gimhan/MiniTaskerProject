package com.service.project.minitasker.controller;


import com.service.project.minitasker.Exeptions.InsufficientBalanceException;
import com.service.project.minitasker.dto.ApiResponse;
import com.service.project.minitasker.entity.Payout;
import com.service.project.minitasker.service.PayOutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    @GetMapping("/getAll")
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
    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createPayout(@RequestBody Payout payout) {
        System.out.println(payout.getAmount());
        Payout created = payOutService.createPayout(payout);

        return ResponseEntity.ok(new ApiResponse(200, "Payout request created successfully", created));
    }

    // --------------------- Update payout status ---------------------
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updatePayoutStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        try {
            Payout updated = payOutService.updateStatus(id, status);
            return ResponseEntity.ok(
                    new ApiResponse(200, "Payout status updated successfully", updated)
            );
        } catch (InsufficientBalanceException e) {
            // Send the message to the frontend
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(500, "Failed to update payout", null));
        }
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
