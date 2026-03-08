package com.collabflow.domain.activity.model;

import com.collabflow.events.model.DomainEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "activity_feed_items", indexes = {
        @Index(name = "idx_activity_feed_team_created", columnList = "team_id, occurred_at DESC"),
        @Index(name = "idx_activity_feed_project_created", columnList = "project_id, occurred_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityFeedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false, unique = true)
    private UUID eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 64)
    private DomainEventType eventType;

    @Column(name = "aggregate_type", nullable = false, length = 64)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private UUID aggregateId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_username", length = 100)
    private String actorUsername;

    @Column(name = "team_id")
    private UUID teamId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;
}
