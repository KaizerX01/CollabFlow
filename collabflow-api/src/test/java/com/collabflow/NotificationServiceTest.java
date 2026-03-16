package com.collabflow;

import com.collabflow.domain.notification.dto.InAppNotificationResponse;
import com.collabflow.domain.notification.model.InAppNotification;
import com.collabflow.domain.notification.repository.InAppNotificationRepository;
import com.collabflow.domain.notification.service.NotificationService;
import com.collabflow.events.model.DomainEvent;
import com.collabflow.events.model.DomainEventType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private InAppNotificationRepository inAppNotificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("1 - createAndPush returns null when duplicate already exists")
    void t01_createAndPush_duplicateExists_returnsNull() {
        UUID recipientId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        DomainEvent event = DomainEvent.builder()
                .eventId(eventId)
                .eventType(DomainEventType.TASK_MOVED)
                .aggregateType("Task")
                .aggregateId(UUID.randomUUID())
                .build();

        when(inAppNotificationRepository.existsByEventIdAndRecipientId(eq(eventId), eq(recipientId)))
                .thenReturn(true);

        InAppNotificationResponse result = notificationService.createAndPush(
                recipientId,
                "alice",
                event,
                "Task Moved",
                "Task moved",
                "/teams/t1/projects/p1/workspace"
        );

        assertNull(result);
        verify(inAppNotificationRepository, never()).save(any(InAppNotification.class));
        verify(messagingTemplate, never()).convertAndSendToUser(any(), any(), any());
    }

    @Test
    @DisplayName("2 - createAndPush handles insert race without throwing")
    void t02_createAndPush_duplicateRace_returnsNull() {
        UUID recipientId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        DomainEvent event = DomainEvent.builder()
                .eventId(eventId)
                .eventType(DomainEventType.PROJECT_CREATED)
                .aggregateType("Project")
                .aggregateId(UUID.randomUUID())
                .build();

        when(inAppNotificationRepository.existsByEventIdAndRecipientId(eq(eventId), eq(recipientId)))
                .thenReturn(false);
        when(inAppNotificationRepository.save(any(InAppNotification.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key"));

        InAppNotificationResponse result = notificationService.createAndPush(
                recipientId,
                "alice",
                event,
                "Project Created",
                "Project created",
                "/teams/t1/projects/p1"
        );

        assertNull(result);
        verify(messagingTemplate, never()).convertAndSendToUser(any(), any(), any());
    }

    @Test
    @DisplayName("3 - createAndPush saves and pushes for fresh event")
    void t03_createAndPush_success() {
        UUID recipientId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        DomainEvent event = DomainEvent.builder()
                .eventId(eventId)
                .eventType(DomainEventType.CHAT_MESSAGE_SENT)
                .aggregateType("ChatMessage")
                .aggregateId(UUID.randomUUID())
                .build();

        InAppNotification saved = InAppNotification.builder()
                .id(notificationId)
                .eventId(eventId)
                .eventType(DomainEventType.CHAT_MESSAGE_SENT)
                .recipientId(recipientId)
                .recipientUsername("alice")
                .title("New Chat Message")
                .message("Someone sent a message")
                .route("/teams/t1/projects/p1/workspace")
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        when(inAppNotificationRepository.existsByEventIdAndRecipientId(eq(eventId), eq(recipientId)))
                .thenReturn(false);
        when(inAppNotificationRepository.save(any(InAppNotification.class))).thenReturn(saved);

        InAppNotificationResponse result = notificationService.createAndPush(
                recipientId,
                "alice",
                event,
                "New Chat Message",
                "Someone sent a message",
                "/teams/t1/projects/p1/workspace"
        );

        assertNotNull(result);
        assertEquals(notificationId, result.getId());
        assertEquals("New Chat Message", result.getTitle());

        ArgumentCaptor<InAppNotificationResponse> payloadCaptor = ArgumentCaptor.forClass(InAppNotificationResponse.class);
        verify(messagingTemplate).convertAndSendToUser(eq("alice"), eq("/queue/notifications"), payloadCaptor.capture());
        assertEquals(notificationId, payloadCaptor.getValue().getId());
    }
}
