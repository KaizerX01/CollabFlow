package com.collabflow.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private List<TeamSummary> teams;
    private List<TaskSummary> assignedTasks;
    private List<ActivitySummary> recentActivity;
    private DashboardStats stats;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TeamSummary {
        private UUID id;
        private String name;
        private String description;
        private int memberCount;
        private String role;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskSummary {
        private UUID id;
        private String title;
        private String description;
        private Short priority;
        private Instant dueDate;
        private boolean isCompleted;
        private String projectName;
        private UUID projectId;
        private String teamName;
        private UUID teamId;
        private String taskListName;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ActivitySummary {
        private UUID id;
        private String message;
        private String eventType;
        private String actorUsername;
        private Instant occurredAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardStats {
        private int totalTeams;
        private int totalAssignedTasks;
        private int overdueTasks;
        private int completedTasksThisWeek;
    }
}
