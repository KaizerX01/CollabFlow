package com.collabflow.domain.notification.service;

import com.collabflow.domain.notification.dto.InAppNotificationResponse;
import com.collabflow.domain.notification.model.InAppNotification;
import com.collabflow.domain.notification.repository.InAppNotificationRepository;
import com.collabflow.events.model.DomainEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private static final int MAX_LIMIT = 100;

    private final InAppNotificationRepository inAppNotificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<InAppNotificationResponse> getNotifications(UUID userId, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
        return inAppNotificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long getUnreadCount(UUID userId) {
        return inAppNotificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public InAppNotificationResponse markRead(UUID userId, UUID notificationId) {
        InAppNotification notification = inAppNotificationRepository
                .findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = inAppNotificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return inAppNotificationRepository.markAllReadByRecipientId(userId);
    }

    @Transactional
    public InAppNotificationResponse createAndPush(
            UUID recipientId,
            String recipientUsername,
            DomainEvent event,
            String title,
            String message,
            String route
    ) {
        if (inAppNotificationRepository.existsByEventIdAndRecipientId(event.getEventId(), recipientId)) {
            return null;
        }

        InAppNotification saved = inAppNotificationRepository.save(InAppNotification.builder()
                .eventId(event.getEventId())
                .eventType(event.getEventType())
                .recipientId(recipientId)
                .recipientUsername(recipientUsername)
                .title(title)
                .message(message)
                .route(route)
                .isRead(false)
                .build());

        InAppNotificationResponse response = toResponse(saved);
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/notifications", response);
        return response;
    }

    private InAppNotificationResponse toResponse(InAppNotification entity) {
        return new InAppNotificationResponse(
                entity.getId(),
                entity.getEventId(),
                entity.getEventType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getRoute(),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }
}
