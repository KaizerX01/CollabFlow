package com.collabflow.domain.activity.dto;

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
public class ActivityFeedItemResponse {
    private UUID id;
    private UUID eventId;
    private DomainEventType eventType;
    private UUID actorId;
    private String actorUsername;
    private UUID teamId;
    private UUID projectId;
    private String message;
    private Instant occurredAt;
}
