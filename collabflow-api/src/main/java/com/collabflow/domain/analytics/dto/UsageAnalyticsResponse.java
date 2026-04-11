package com.collabflow.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageAnalyticsResponse {

    private UUID teamId;
    private UUID projectId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private long totalEvents;
    private List<EventTypeCount> byEventType;
    private List<DailyPoint> daily;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EventTypeCount {
        private String eventType;
        private long count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyPoint {
        private LocalDate day;
        private long count;
    }
}
