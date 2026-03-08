package com.collabflow.events.consumer;

import com.collabflow.events.model.DomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuditEventConsumer {

    @KafkaListener(
            topics = "${app.events.topic.system}",
            groupId = "${app.events.consumer-groups.audit}"
    )
    public void consume(DomainEvent event) {
        log.info("[audit-service] eventId={} eventType={} occurredAt={} actor={}",
                event.getEventId(), event.getEventType(), event.getOccurredAt(), event.getActorId());
    }
}
