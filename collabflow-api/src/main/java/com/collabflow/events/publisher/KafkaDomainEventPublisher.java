package com.collabflow.events.publisher;

import com.collabflow.events.model.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaDomainEventPublisher implements DomainEventPublisher {

    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    @Value("${app.events.topic.system}")
    private String systemEventsTopic;

    @Override
    public void publish(DomainEvent event) {
        if (event == null || event.getEventType() == null) {
            return;
        }

        if (TransactionSynchronizationManager.isActualTransactionActive()
            && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendEvent(event);
                }
            });
            return;
        }

        sendEvent(event);
    }

    private void sendEvent(DomainEvent event) {
        if (event.getAggregateId() == null) {
            log.warn("Skipping domain event {} because aggregateId is missing", event.getEventType());
            return;
        }

        String key = event.getTeamId() != null
                ? event.getTeamId().toString()
                : event.getAggregateId().toString();

        kafkaTemplate.send(systemEventsTopic, key, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish domain event {}", event.getEventType(), ex);
                    } else {
                        log.debug("Published domain event {} to topic {}", event.getEventType(), systemEventsTopic);
                    }
                });
    }
}
