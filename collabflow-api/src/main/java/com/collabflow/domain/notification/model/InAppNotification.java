package com.collabflow.domain.notification.model;

import com.collabflow.events.model.DomainEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "in_app_notifications", indexes = {
        @Index(name = "idx_notifications_recipient_created", columnList = "recipient_id, created_at DESC"),
        @Index(name = "idx_notifications_recipient_unread", columnList = "recipient_id, is_read")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_notifications_event_recipient", columnNames = {"event_id", "recipient_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InAppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 64)
    private DomainEventType eventType;

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Column(name = "recipient_username", nullable = false, length = 100)
    private String recipientUsername;

    @Column(name = "title", nullable = false, length = 140)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "route", length = 255)
    private String route;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
