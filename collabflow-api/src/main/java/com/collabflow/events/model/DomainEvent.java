package com.collabflow.events.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class DomainEvent {

    private UUID eventId;
    private DomainEventType eventType;
    private Instant occurredAt;
    private String aggregateType;
    private UUID aggregateId;
    private UUID actorId;
    private String actorUsername;
    private UUID teamId;
    private UUID projectId;
    private Map<String, Object> payload;

    @Builder
    public DomainEvent(
            UUID eventId,
            DomainEventType eventType,
            Instant occurredAt,
            String aggregateType,
            UUID aggregateId,
            UUID actorId,
            String actorUsername,
            UUID teamId,
            UUID projectId,
            Map<String, Object> payload
    ) {
        this.eventId = eventId == null ? UUID.randomUUID() : eventId;
        this.eventType = eventType;
        this.occurredAt = occurredAt == null ? Instant.now() : occurredAt;
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.actorId = actorId;
        this.actorUsername = actorUsername;
        this.teamId = teamId;
        this.projectId = projectId;
        this.payload = payload == null ? Map.of() : payload;
    }
}
