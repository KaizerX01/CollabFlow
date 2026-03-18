package com.collabflow.domain.user.service;

import com.collabflow.domain.activity.model.ActivityFeedItem;
import com.collabflow.domain.activity.repository.ActivityFeedItemRepository;
import com.collabflow.domain.task.model.Task;
import com.collabflow.domain.task.model.TaskAssignment;
import com.collabflow.domain.task.repository.TaskAssignmentRepository;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.model.TeamMembership;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.dto.DashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TeamRepository teamRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final ActivityFeedItemRepository activityFeedItemRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID userId) {
        // 1. Teams
        List<Team> teams = teamRepository.findAllByUserId(userId);

        List<DashboardResponse.TeamSummary> teamSummaries = teams.stream()
                .map(team -> {
                    String role = team.getTeamMemberships().stream()
                            .filter(m -> m.getUser().getId().equals(userId))
                            .findFirst()
                            .map(m -> m.getRole().name())
                            .orElse("MEMBER");

                    return DashboardResponse.TeamSummary.builder()
                            .id(team.getId())
                            .name(team.getName())
                            .description(team.getDescription())
                            .memberCount(team.getTeamMemberships().size())
                            .role(role)
                            .build();
                })
                .toList();

        // 2. Assigned tasks
        List<TaskAssignment> assignments = taskAssignmentRepository.findByUserIdWithTaskAndProject(userId);

        List<DashboardResponse.TaskSummary> taskSummaries = assignments.stream()
                .map(ta -> {
                    Task task = ta.getTask();
                    String teamName = teams.stream()
                            .filter(t -> t.getId().equals(task.getProject().getTeamId()))
                            .findFirst()
                            .map(Team::getName)
                            .orElse("");

                    return DashboardResponse.TaskSummary.builder()
                            .id(task.getId())
                            .title(task.getTitle())
                            .description(task.getDescription())
                            .priority(task.getPriority())
                            .dueDate(task.getDueDate())
                            .isCompleted(task.isCompleted())
                            .projectName(task.getProject().getName())
                            .projectId(task.getProject().getId())
                            .teamName(teamName)
                            .teamId(task.getProject().getTeamId())
                            .taskListName(task.getTaskList().getName())
                            .build();
                })
                .toList();

        // 3. Recent activity across all user teams
        List<UUID> teamIds = teams.stream().map(Team::getId).toList();
        List<ActivityFeedItem> activityItems = teamIds.isEmpty()
                ? List.of()
                : activityFeedItemRepository.findByTeamIdInOrderByOccurredAtDesc(teamIds, PageRequest.of(0, 15));

        List<DashboardResponse.ActivitySummary> activitySummaries = activityItems.stream()
                .map(item -> DashboardResponse.ActivitySummary.builder()
                        .id(item.getId())
                        .message(item.getMessage())
                        .eventType(item.getEventType().name())
                        .actorUsername(item.getActorUsername())
                        .occurredAt(item.getOccurredAt())
                        .build())
                .toList();

        // 4. Stats
        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant now = Instant.now();

        int overdueTasks = (int) taskSummaries.stream()
                .filter(t -> !t.isCompleted() && t.getDueDate() != null && t.getDueDate().isBefore(now))
                .count();

        int completedThisWeek = (int) taskSummaries.stream()
                .filter(DashboardResponse.TaskSummary::isCompleted)
                .count();

        DashboardResponse.DashboardStats stats = DashboardResponse.DashboardStats.builder()
                .totalTeams(teamSummaries.size())
                .totalAssignedTasks((int) taskSummaries.stream().filter(t -> !t.isCompleted()).count())
                .overdueTasks(overdueTasks)
                .completedTasksThisWeek(completedThisWeek)
                .build();

        return DashboardResponse.builder()
                .teams(teamSummaries)
                .assignedTasks(taskSummaries)
                .recentActivity(activitySummaries)
                .stats(stats)
                .build();
    }
}
