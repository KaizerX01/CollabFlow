package com.collabflow.events.publisher;

import com.collabflow.events.model.DomainEvent;

public interface DomainEventPublisher {
    void publish(DomainEvent event);
}
