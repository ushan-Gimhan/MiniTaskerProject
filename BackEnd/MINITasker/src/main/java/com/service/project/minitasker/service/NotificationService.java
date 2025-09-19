package com.service.project.minitasker.service;

import com.service.project.minitasker.entity.Notification;

import java.util.List;

public interface NotificationService {
    List<Notification> getAllNotifications();

    List<Notification> getByUserId(Long userId);

    Notification getNotificationById(Long id);

    Notification saveNotification(Notification notification);

    Notification markAsRead(Long id);

    void deleteNotification(Long id);
}
