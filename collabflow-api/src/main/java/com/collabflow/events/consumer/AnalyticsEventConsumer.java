package com.collabflow.events.consumer;

import com.collabflow.events.model.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsEventConsumer {

    private static final UUID ZERO_UUID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final JdbcTemplate jdbcTemplate;

    @KafkaListener(
            topics = "${app.events.topic.system}",
            groupId = "${app.events.consumer-groups.analytics}"
    )
    @Transactional
    public void consume(DomainEvent event) {
        if (event == null || event.getEventType() == null || event.getOccurredAt() == null) {
            return;
        }

        LocalDate day = event.getOccurredAt().atZone(ZoneOffset.UTC).toLocalDate();
        UUID teamId = event.getTeamId() == null ? ZERO_UUID : event.getTeamId();
        UUID projectId = event.getProjectId() == null ? ZERO_UUID : event.getProjectId();

        jdbcTemplate.update(
                """
                INSERT INTO analytics_usage_daily (day, team_id, project_id, event_type, event_count)
                VALUES (?, ?, ?, ?, 1)
                ON CONFLICT (day, team_id, project_id, event_type)
                DO UPDATE SET event_count = analytics_usage_daily.event_count + 1
                """,
                day,
                teamId,
                projectId,
                event.getEventType().name()
        );

        log.info("[analytics-service] type={} team={} project={} aggregate={}",
                event.getEventType(), event.getTeamId(), event.getProjectId(), event.getAggregateId());
    }
}
