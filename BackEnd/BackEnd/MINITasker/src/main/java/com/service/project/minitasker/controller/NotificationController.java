package com.service.project.minitasker.controller;


import com.service.project.minitasker.dto.ApiResponse;
import com.service.project.minitasker.entity.Notification;
import com.service.project.minitasker.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notify")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    // --------------------- Get all notifications ---------------------
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(new ApiResponse(200, "Notifications fetched successfully", notifications));
    }

    // --------------------- Get notifications by user ---------------------
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getNotificationsByUser(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getByUserId(userId);
        return ResponseEntity.ok(new ApiResponse(200, "User notifications fetched successfully", notifications));
    }

    // --------------------- Get single notification ---------------------
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getNotification(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(new ApiResponse(200, "Notification fetched successfully", notification));
    }

    // --------------------- Create a new notification ---------------------
    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.saveNotification(notification);
        return ResponseEntity.ok(new ApiResponse(201, "Notification created successfully", saved));
    }

    // --------------------- Mark notification as read ---------------------
    @PutMapping("/read/{id}")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse(200, "Notification marked as read", updated));
    }

    // --------------------- Delete notification ---------------------
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse(200, "Notification deleted successfully", null));
    }
}
