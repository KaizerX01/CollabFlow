package com.collabflow.domain.task.service;

import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.project.repository.ProjectRepository;
import com.collabflow.domain.task.dto.TaskCreateRequest;
import com.collabflow.domain.task.dto.TaskResponse;
import com.collabflow.domain.task.dto.TaskUpdateRequest;
import com.collabflow.domain.task.exception.TaskException;
import com.collabflow.domain.task.exception.TaskNotFoundException;
import com.collabflow.domain.task.mapper.TaskMapper;
import com.collabflow.domain.task.model.Task;
import com.collabflow.domain.task.model.TaskAssignment;
import com.collabflow.domain.task.model.TaskAssignmentId;
import com.collabflow.domain.task.repository.TaskAssignmentRepository;
import com.collabflow.domain.task.repository.TaskRepository;
import com.collabflow.domain.tasklist.exception.TaskListNotFoundException;
import com.collabflow.domain.tasklist.model.TaskList;
import com.collabflow.domain.tasklist.repository.TaskListRepository;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.model.TeamMembership;
import com.collabflow.domain.team.model.enums.TeamRole;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskListRepository taskListRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final TaskMapper mapper;

    // -------------------------
    // CREATE TASK (with optional assignees)
    // -------------------------
    public TaskResponse createTask(UUID taskListId, TaskCreateRequest request, User user) {
        TaskList taskList = getTaskList(taskListId);
        Map<UUID, Project> projectCache = new HashMap<>();
        Map<UUID, Team> teamCache = new HashMap<>();

        Project project = getProjectCached(taskList.getProject().getId(), projectCache);

        // Verify membership
        verifyTeamMembership(getTeamCached(project.getTeamId(), teamCache), user.getId());

        // position default (bottom)
        Double position = request.getPosition();
        if (position == null) {
            position = taskRepository.findMaxPositionByTaskListId(taskListId)
                    .map(max -> max + 1000.0)
                    .orElse(1000.0);
        }

        Task task = Task.builder()
                .project(project)
                .taskList(taskList)
                .createdBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .position(position)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .dueDate(request.getDueDate())
                .isCompleted(false)
                .isDeleted(false)
                .build();

        Task saved = taskRepository.save(task);

        // If assignee ids provided, sync assignments
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            syncTaskAssignments(saved, request.getAssigneeIds(), project);
            // reload saved to ensure assignments relationship available if needed
            saved = taskRepository.findById(saved.getId()).orElse(saved);
        }

        return buildTaskResponse(saved, null);
    }

    // -------------------------
    // GET ALL TASKS IN A LIST (returns assignees)
    // -------------------------
    public List<TaskResponse> getTaskListTasks(UUID taskListId, UUID userId) {
        TaskList taskList = getTaskList(taskListId);
        Map<UUID, Project> projectCache = new HashMap<>();
        Map<UUID, Team> teamCache = new HashMap<>();

        Project project = getProjectCached(taskList.getProject().getId(), projectCache);
        verifyTeamMembership(getTeamCached(project.getTeamId(), teamCache), userId);

        List<Task> tasks = taskRepository.findByTaskList_IdAndIsDeletedFalseOrderByPositionAsc(taskListId);

        Map<UUID, List<TaskAssignment>> assignmentsByTask = loadAssignmentsWithUsers(tasks);

        return tasks.stream()
            .map(task -> buildTaskResponse(task, assignmentsByTask))
            .collect(Collectors.toList());
    }

    // -------------------------
    // GET ALL TASKS IN A PROJECT (flat list, with assignees)
    // -------------------------
    public List<TaskResponse> getProjectTasks(UUID projectId, UUID userId) {
        Map<UUID, Project> projectCache = new HashMap<>();
        Map<UUID, Team> teamCache = new HashMap<>();

        Project project = getProjectCached(projectId, projectCache);
        verifyTeamMembership(getTeamCached(project.getTeamId(), teamCache), userId);

        List<Task> tasks = taskRepository.findByProject_IdAndIsDeletedFalseOrderByPositionAsc(projectId);

        Map<UUID, List<TaskAssignment>> assignmentsByTask = loadAssignmentsWithUsers(tasks);

        return tasks.stream()
            .map(task -> buildTaskResponse(task, assignmentsByTask))
            .collect(Collectors.toList());
    }

    // -------------------------
    // GET SINGLE TASK
    // -------------------------
    public TaskResponse getTaskById(UUID taskId, UUID userId) {
        Task task = getTask(taskId);
        Map<UUID, Team> teamCache = new HashMap<>();
        verifyTeamMembership(getTeamCached(task.getProject().getTeamId(), teamCache), userId);
        return buildTaskResponse(task, null);
    }

    // -------------------------
    // UPDATE TASK (and optionally sync assignees)
    // -------------------------
    public TaskResponse updateTask(UUID taskId, TaskUpdateRequest request, User user) {
        Task task = getTask(taskId);
        Map<UUID, Team> teamCache = new HashMap<>();
        verifyTeamMembership(getTeamCached(task.getProject().getTeamId(), teamCache), user.getId());

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPosition() != null) task.setPosition(request.getPosition());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getIsCompleted() != null) task.setCompleted(request.getIsCompleted());

        Task saved = taskRepository.save(task);

        // If assigneeIds provided, synchronize assignments (replace current with provided)
        if (request.getAssigneeIds() != null) {
            syncTaskAssignments(saved, request.getAssigneeIds(), task.getProject());
            saved = taskRepository.findById(saved.getId()).orElse(saved);
        }

        return buildTaskResponse(saved, null);
    }

    // -------------------------
    // MOVE TASK (same as your previous logic, keep behavior)
    // -------------------------
    public TaskResponse moveTask(UUID taskId, UUID newTaskListId, Double newPosition, User user) {
        Task task = getTask(taskId);
        TaskList newTaskList = getTaskList(newTaskListId);
        UUID oldTaskListId = task.getTaskList().getId();

        Map<UUID, Project> projectCache = new HashMap<>();
        Map<UUID, Team> teamCache = new HashMap<>();

        // verify same project
        if (!task.getProject().getId().equals(newTaskList.getProject().getId())) {
            throw new TaskException("Cannot move task to a different project");
        }

        // verify access
        Project project = getProjectCached(task.getProject().getId(), projectCache);
        verifyTeamMembership(getTeamCached(project.getTeamId(), teamCache), user.getId());

        Double position = newPosition;
        if (position == null) {
            position = taskRepository.findMaxPositionByTaskListId(newTaskListId)
                    .map(max -> max + 1000.0)
                    .orElse(1000.0);
        }

        task.setTaskList(newTaskList);
        task.setPosition(position);

        Task updated = taskRepository.save(task);

        rebalancePositions(newTaskListId);
        if (!oldTaskListId.equals(newTaskListId)) {
            rebalancePositions(oldTaskListId);
        }

        // optional: rebalancing (if you use needsRebalance/rebalancePositions, keep them)
        // (not altering that logic here - you can reuse your existing rebalance methods)

        return buildTaskResponse(updated, null);
    }

    private void rebalancePositions(UUID taskListId) {
        List<Task> tasks = taskRepository.findByTaskList_IdAndIsDeletedFalseOrderByPositionAsc(taskListId);
        double step = 1000.0;
        for (int i = 0; i < tasks.size(); i++) {
            tasks.get(i).setPosition((i + 1) * step);
        }
        taskRepository.saveAll(tasks);
    }

    // -------------------------
    // TOGGLE COMPLETE (shortcut)
    // -------------------------
    public TaskResponse toggleComplete(UUID taskId, User user) {
        Task task = getTask(taskId);
        Map<UUID, Team> teamCache = new HashMap<>();
        verifyTeamMembership(getTeamCached(task.getProject().getTeamId(), teamCache), user.getId());

        task.setCompleted(!task.isCompleted());
        Task updated = taskRepository.save(task);
        return buildTaskResponse(updated, null);
    }

    // -------------------------
    // DELETE (soft)
    // -------------------------
    public void deleteTask(UUID taskId, User user) {
        Task task = getTask(taskId);
        Map<UUID, Team> teamCache = new HashMap<>();
        verifyTeamMembership(getTeamCached(task.getProject().getTeamId(), teamCache), user.getId());

        task.setDeleted(true);
        taskRepository.save(task);
    }

    // -------------------------
    // ASSIGN / UNASSIGN helpers
    // -------------------------
    private void syncTaskAssignments(Task task, List<UUID> newAssigneeIds, Project project) {
        if (newAssigneeIds == null) return;

        // Normalize input (unique)
        Set<UUID> newIds = new HashSet<>(newAssigneeIds);

        // Load existing assignments
        List<TaskAssignment> existing = assignmentRepository.findByTask_Id(task.getId());
        Set<UUID> existingIds = existing.stream()
                .map(a -> a.getUser().getId())
                .collect(Collectors.toSet());

        // Delete removed assignments
        for (TaskAssignment a : existing) {
            UUID uid = a.getUser().getId();
            if (!newIds.contains(uid)) {
                assignmentRepository.deleteByTask_IdAndUser_Id(task.getId(), uid);
            }
        }

        // Add new assignments
        for (UUID uid : newIds) {
            if (!existingIds.contains(uid)) {
                // Validate user belongs to project team
                if (!isUserInProjectTeam(uid, project)) {
                    throw new TaskException("User is not a member of the project team: " + uid);
                }
                // fetch user entity
                User u = userRepository.findById(uid)
                        .orElseThrow(() -> new TaskException("User not found: " + uid));

                TaskAssignmentId id = new TaskAssignmentId(task.getId(), uid);
                TaskAssignment assignment = new TaskAssignment();
                assignment.setId(id);
                assignment.setTask(task);
                assignment.setUser(u);
                assignment.setAssignedAt(OffsetDateTime.now());

                assignmentRepository.save(assignment);
            }
        }
    }

    private boolean isUserInProjectTeam(UUID userId, Project project) {
        Team team = getTeam(project.getTeamId());
        return team.getTeamMemberships().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));
    }

    // -------------------------
    // Build response (maps task -> dto + assignees)
    // -------------------------
    private TaskResponse buildTaskResponse(Task task, Map<UUID, List<TaskAssignment>> assignmentCache) {
        TaskResponse response = mapper.toResponse(task);

        List<TaskAssignment> assignments;
        if (assignmentCache != null) {
            assignments = assignmentCache.getOrDefault(task.getId(), Collections.emptyList());
        } else {
            assignments = assignmentRepository.findByTask_Id(task.getId());
        }

        List<com.collabflow.domain.task.dto.TaskAssignmentResponse> assignees =
                assignments.stream()
                        .map(mapper::toAssignmentResponse)
                        .collect(Collectors.toList());

        response.setAssignees(assignees);
        return response;
    }

    private Map<UUID, List<TaskAssignment>> loadAssignmentsWithUsers(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return Collections.emptyMap();
        }

        List<UUID> taskIds = tasks.stream()
                .map(Task::getId)
                .toList();

        List<TaskAssignment> assignments = assignmentRepository.findByTask_IdInWithUser(taskIds);

        return assignments.stream()
                .collect(Collectors.groupingBy(a -> a.getTask().getId()));
    }

    // -------------------------
    // Helpers: loaders + membership check
    // -------------------------
    private Task getTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));
    }

    private TaskList getTaskList(UUID listId) {
        return taskListRepository.findById(listId)
                .filter(tl -> !tl.isDeleted())
                .orElseThrow(() -> new TaskListNotFoundException("Task list not found with id: " + listId));
    }

    private Project getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + projectId));
    }

    private Project getProjectCached(UUID projectId, Map<UUID, Project> cache) {
        return cache.computeIfAbsent(projectId, this::getProject);
    }

    private Team getTeam(UUID teamId) {
        return teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found with id: " + teamId));
    }

    private Team getTeamCached(UUID teamId, Map<UUID, Team> cache) {
        return cache.computeIfAbsent(teamId, this::getTeam);
    }

    private TeamMembership verifyTeamMembership(Team team, UUID userId) {
        return team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));
    }
}
