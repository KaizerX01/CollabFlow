package com.collabflow.events.consumer;

import com.collabflow.events.model.DomainEvent;
import com.collabflow.events.model.DomainEventType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EmailEventConsumer {

    @KafkaListener(
            topics = "${app.events.topic.system}",
            groupId = "${app.events.consumer-groups.email}"
    )
    public void consume(DomainEvent event) {
        if (event.getEventType() == DomainEventType.TEAM_MEMBER_INVITED
                || event.getEventType() == DomainEventType.USER_REGISTERED) {
            // Placeholder only: email sending will be implemented later.
            log.info("[email-service] placeholder - queued email eventType={} eventId={}",
                    event.getEventType(), event.getEventId());
        }
    }
}
