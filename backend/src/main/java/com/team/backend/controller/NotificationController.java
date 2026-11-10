package com.team.backend.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.backend.dto.ApiResponse;
import com.team.backend.entity.Notification;
import com.team.backend.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Notifications", description = "Endpoints for user notifications and alerts")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    // 1. GET /api/notifications/user/{userId}
    @Operation(summary = "Get all notifications for a specific user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(ApiResponse.ok("Notifications fetched successfully", notifications));
    }
    // 2. GET /api/notifications/user/{userId}/unread-count
    @Operation(summary = "Get count of unread notifications for a user")
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.ok("Unread count fetched", count));
    }
    // 3. PATCH /api/notifications/{id}/read
    @Operation(summary = "Mark a notification as read")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", updated));
    }
    // 4. POST /api/notifications (Create a test notification)
    @Operation(summary = "Create a new notification")
    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> createNotification(
            @RequestParam Long userId,
            @RequestParam String message) {
        Notification created = notificationService.createNotification(userId, message);
        return ResponseEntity.ok(ApiResponse.ok("Notification created successfully", created));
    }
}