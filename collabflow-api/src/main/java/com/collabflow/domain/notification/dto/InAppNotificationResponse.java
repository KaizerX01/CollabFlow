package com.collabflow.domain.notification.dto;

import com.collabflow.events.model.DomainEventType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InAppNotificationResponse {
    private UUID id;
    private UUID eventId;
    private DomainEventType eventType;
    private String title;
    private String message;
    private String route;
    private boolean isRead;
    private Instant createdAt;
}
