package com.team.backend.service;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team.backend.entity.Notification;
import com.team.backend.repository.NotificationRepository;
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + notificationId));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    // 4. Create a new notification (when an application is reviewed, interview scheduled, etc.)
    @Transactional
    public Notification createNotification(Long userId, String message) {
        Notification notification = new Notification(userId, message);
        return notificationRepository.save(notification);
    }
}