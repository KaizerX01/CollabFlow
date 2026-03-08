package com.collabflow.config;

import com.collabflow.events.model.DomainEvent;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
@RequiredArgsConstructor
public class KafkaEventConfig {

    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    @Value("${app.events.topic.system}")
    private String systemTopic;

    @Value("${app.events.topic.dead-letter}")
    private String deadLetterTopic;

    @Value("${app.events.retry.max-attempts:3}")
    private long maxAttempts;

    @Value("${app.events.retry.backoff-ms:1000}")
    private long backOffMs;

    @Bean
    public NewTopic systemEventsTopic() {
        return TopicBuilder.name(systemTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic systemEventsDeadLetterTopic() {
        return TopicBuilder.name(deadLetterTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public DefaultErrorHandler kafkaErrorHandler() {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
                kafkaTemplate,
                (record, exception) -> new TopicPartition(deadLetterTopic, record.partition())
        );

        // retries = maxFailures - 1 because first processing attempt is outside the retry loop
        long retryAttempts = Math.max(maxAttempts - 1, 0);
        return new DefaultErrorHandler(recoverer, new FixedBackOff(backOffMs, retryAttempts));
    }
}
