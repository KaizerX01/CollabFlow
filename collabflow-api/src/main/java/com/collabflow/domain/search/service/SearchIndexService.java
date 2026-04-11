package com.collabflow.domain.search.service;

import com.collabflow.domain.activity.model.ActivityFeedItem;
import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.search.model.WorkItemDocument;
import com.collabflow.domain.search.repository.WorkItemSearchRepository;
import com.collabflow.domain.task.model.Task;
import com.collabflow.domain.task.model.TaskAssignment;
import com.collabflow.domain.task.repository.TaskAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchIndexService {

    private final WorkItemSearchRepository repository;
    private final TaskAssignmentRepository taskAssignmentRepository;

    @Value("${app.search.enabled:true}")
    private boolean searchEnabled;

    public void indexTask(Task task) {
        if (!searchEnabled || task == null || task.isDeleted()) {
            return;
        }

        try {
            List<String> assignees = taskAssignmentRepository.findByTask_Id(task.getId()).stream()
                    .map(TaskAssignment::getUser)
                    .filter(user -> user != null && user.getUsername() != null)
                    .map(user -> user.getUsername().toLowerCase(Locale.ROOT))
                    .toList();

            WorkItemDocument doc = WorkItemDocument.builder()
                    .id(taskDocId(task.getId()))
                    .resourceType("task")
                    .resourceId(task.getId().toString())
                    .teamId(task.getProject().getTeamId().toString())
                    .projectId(task.getProject().getId().toString())
                    .title(task.getTitle())
                    .description(task.getDescription())
                    .taskListName(task.getTaskList() != null ? task.getTaskList().getName() : null)
                    .assignees(assignees)
                    .priority(task.getPriority() == null ? null : Integer.valueOf(task.getPriority()))
                    .completed(task.isCompleted())
                    .updatedAt(task.getUpdatedAt())
                    .build();

            repository.save(doc);
        } catch (Exception ex) {
            log.warn("Failed to index task {} in search engine: {}", task.getId(), ex.getMessage());
        }
    }

    public void indexProject(Project project) {
        if (!searchEnabled || project == null || project.isDeleted()) {
            return;
        }

        try {
            WorkItemDocument doc = WorkItemDocument.builder()
                    .id(projectDocId(project.getId()))
                    .resourceType("project")
                    .resourceId(project.getId().toString())
                    .teamId(project.getTeamId().toString())
                    .projectId(project.getId().toString())
                    .title(project.getName())
                    .description(project.getDescription())
                    .updatedAt(project.getUpdatedAt())
                    .build();

            repository.save(doc);
        } catch (Exception ex) {
            log.warn("Failed to index project {} in search engine: {}", project.getId(), ex.getMessage());
        }
    }

    public void indexActivity(ActivityFeedItem item) {
        if (!searchEnabled || item == null) {
            return;
        }

        try {
            WorkItemDocument doc = WorkItemDocument.builder()
                    .id(activityDocId(item.getId()))
                    .resourceType("activity")
                    .resourceId(item.getId().toString())
                    .teamId(item.getTeamId() == null ? null : item.getTeamId().toString())
                    .projectId(item.getProjectId() == null ? null : item.getProjectId().toString())
                    .title(item.getEventType() == null ? "Activity" : item.getEventType().name())
                    .description(item.getMessage())
                    .actorUsername(item.getActorUsername())
                    .occurredAt(item.getOccurredAt())
                    .updatedAt(item.getOccurredAt())
                    .build();

            repository.save(doc);
        } catch (Exception ex) {
            log.warn("Failed to index activity {} in search engine: {}", item.getId(), ex.getMessage());
        }
    }

    public void deleteTask(UUID taskId) {
        if (!searchEnabled || taskId == null) {
            return;
        }
        try {
            repository.deleteById(taskDocId(taskId));
        } catch (Exception ex) {
            log.warn("Failed to delete task {} from search index: {}", taskId, ex.getMessage());
        }
    }

    public void deleteProject(UUID projectId) {
        if (!searchEnabled || projectId == null) {
            return;
        }
        try {
            repository.deleteById(projectDocId(projectId));
        } catch (Exception ex) {
            log.warn("Failed to delete project {} from search index: {}", projectId, ex.getMessage());
        }
    }

    private static String taskDocId(UUID taskId) {
        return "task:" + taskId;
    }

    private static String projectDocId(UUID projectId) {
        return "project:" + projectId;
    }

    private static String activityDocId(UUID activityId) {
        return "activity:" + activityId;
    }
}
