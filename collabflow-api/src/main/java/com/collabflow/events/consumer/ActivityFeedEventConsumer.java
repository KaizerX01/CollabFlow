package com.collabflow.events.consumer;

import com.collabflow.domain.activity.model.ActivityFeedItem;
import com.collabflow.domain.activity.repository.ActivityFeedItemRepository;
import com.collabflow.events.model.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ActivityFeedEventConsumer {

    private final ActivityFeedItemRepository activityFeedItemRepository;

    @KafkaListener(
            topics = "${app.events.topic.system}",
            groupId = "${app.events.consumer-groups.activity}"
    )
    @Transactional
    public void consume(DomainEvent event) {
        if (event == null || event.getEventId() == null || event.getEventType() == null) {
            return;
        }

        if (activityFeedItemRepository.existsByEventId(event.getEventId())) {
            return;
        }

        ActivityFeedItem item = ActivityFeedItem.builder()
                .eventId(event.getEventId())
                .eventType(event.getEventType())
                .aggregateType(event.getAggregateType())
                .aggregateId(event.getAggregateId())
                .actorId(event.getActorId())
                .actorUsername(event.getActorUsername())
                .teamId(event.getTeamId())
                .projectId(event.getProjectId())
                .message(toHumanMessage(event))
                .occurredAt(event.getOccurredAt())
                .build();

        activityFeedItemRepository.save(item);
    }

    private String toHumanMessage(DomainEvent event) {
        String actor = safeActor(event);

        return switch (event.getEventType()) {
            case USER_REGISTERED -> actor + " registered";
            case TEAM_MEMBER_INVITED -> actor + " invited a new team member";
            case TEAM_MEMBER_JOINED -> actor + " joined the team";
            case PROJECT_CREATED -> actor + " created project \"" + payloadString(event, "projectName") + "\"";
            case TASK_CREATED -> actor + " created task \"" + payloadString(event, "taskTitle") + "\"";
            case TASK_MOVED -> actor + " moved task \"" + payloadString(event, "taskTitle")
                    + "\" to \"" + payloadString(event, "toTaskListName") + "\"";
            case CHAT_MESSAGE_SENT -> actor + " sent a chat message";
        };
    }

    private String safeActor(DomainEvent event) {
        if (event.getActorUsername() == null || event.getActorUsername().isBlank()) {
            return "Someone";
        }
        return event.getActorUsername();
    }

    private String payloadString(DomainEvent event, String key) {
        Object value = event.getPayload() == null ? null : event.getPayload().get(key);
        return value == null ? "Unknown" : value.toString();
    }
}
