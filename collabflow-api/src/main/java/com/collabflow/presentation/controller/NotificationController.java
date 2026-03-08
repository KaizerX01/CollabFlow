package com.collabflow.presentation.controller;

import com.collabflow.domain.notification.dto.InAppNotificationResponse;
import com.collabflow.domain.notification.dto.UnreadCountResponse;
import com.collabflow.domain.notification.service.NotificationService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<InAppNotificationResponse>> list(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "20") int limit
    ) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(notificationService.getNotifications(user.getId(), limit));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> unreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new UnreadCountResponse(notificationService.getUnreadCount(user.getId())));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<InAppNotificationResponse> markRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(notificationService.markRead(user.getId(), notificationId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        int updated = notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}
