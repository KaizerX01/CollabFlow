package com.collabflow.events.consumer;

import com.collabflow.events.model.DomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AnalyticsEventConsumer {

    @KafkaListener(
            topics = "${app.events.topic.system}",
            groupId = "${app.events.consumer-groups.analytics}"
    )
    public void consume(DomainEvent event) {
        log.info("[analytics-service] type={} team={} project={} aggregate={}",
                event.getEventType(), event.getTeamId(), event.getProjectId(), event.getAggregateId());
    }
}
