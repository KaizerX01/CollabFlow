package com.collabflow.domain.analytics.service;

import com.collabflow.domain.analytics.dto.UsageAnalyticsResponse;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsageAnalyticsService {

    private static final UUID ZERO_UUID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final JdbcTemplate jdbcTemplate;
    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public UsageAnalyticsResponse getUsage(UUID teamId, UUID projectId, int days, UUID userId) {
        verifyTeamMembership(teamId, userId);

        int boundedDays = Math.max(1, Math.min(days, 120));
        LocalDate toDate = LocalDate.now();
        LocalDate fromDate = toDate.minusDays(boundedDays - 1L);

        UUID normalizedProjectId = projectId == null ? ZERO_UUID : projectId;

        String projectFilterSql = projectId == null
                ? "AND project_id <> ?"
                : "AND project_id = ?";

        Long totalEvents = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(SUM(event_count), 0)
                FROM analytics_usage_daily
                WHERE team_id = ?
                  AND day BETWEEN ? AND ?
                  """ + projectFilterSql,
                Long.class,
                teamId,
                Date.valueOf(fromDate),
                Date.valueOf(toDate),
                normalizedProjectId
        );

        List<UsageAnalyticsResponse.EventTypeCount> byType = jdbcTemplate.query(
                """
                SELECT event_type, SUM(event_count) AS total_count
                FROM analytics_usage_daily
                WHERE team_id = ?
                  AND day BETWEEN ? AND ?
                  """ + projectFilterSql + " GROUP BY event_type ORDER BY total_count DESC",
                (rs, rowNum) -> UsageAnalyticsResponse.EventTypeCount.builder()
                        .eventType(rs.getString("event_type"))
                        .count(rs.getLong("total_count"))
                        .build(),
                teamId,
                Date.valueOf(fromDate),
                Date.valueOf(toDate),
                normalizedProjectId
        );

        List<UsageAnalyticsResponse.DailyPoint> daily = jdbcTemplate.query(
                """
                SELECT day, SUM(event_count) AS total_count
                FROM analytics_usage_daily
                WHERE team_id = ?
                  AND day BETWEEN ? AND ?
                  """ + projectFilterSql + " GROUP BY day ORDER BY day ASC",
                (rs, rowNum) -> UsageAnalyticsResponse.DailyPoint.builder()
                        .day(rs.getDate("day").toLocalDate())
                        .count(rs.getLong("total_count"))
                        .build(),
                teamId,
                Date.valueOf(fromDate),
                Date.valueOf(toDate),
                normalizedProjectId
        );

        return UsageAnalyticsResponse.builder()
                .teamId(teamId)
                .projectId(projectId)
                .fromDate(fromDate)
                .toDate(toDate)
                .totalEvents(totalEvents == null ? 0L : totalEvents)
                .byEventType(byType)
                .daily(daily)
                .build();
    }

    private void verifyTeamMembership(UUID teamId, UUID userId) {
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamException("Team not found"));

        team.getTeamMemberships().stream()
                .filter(membership -> membership.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));
    }
}
