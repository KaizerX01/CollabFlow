package com.collabflow.domain.tasklist.service;

import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.project.repository.ProjectRepository;
import com.collabflow.domain.tasklist.dto.TaskListCreateRequest;
import com.collabflow.domain.tasklist.dto.TaskListResponse;
import com.collabflow.domain.tasklist.dto.TaskListUpdateRequest;
import com.collabflow.domain.tasklist.exception.TaskListException;
import com.collabflow.domain.tasklist.exception.TaskListNotFoundException;
import com.collabflow.domain.tasklist.mapper.TaskListMapper;
import com.collabflow.domain.tasklist.model.TaskList;
import com.collabflow.domain.tasklist.repository.TaskListRepository;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.model.TeamMembership;
import com.collabflow.domain.team.model.enums.TeamRole;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.model.User;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskListService {

    private final TaskListRepository taskListRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TaskListMapper mapper;

    @Transactional
    public TaskListResponse createTaskList(UUID projectId, TaskListCreateRequest request, User user) {
        Project project = getProject(projectId);

        Team team = getTeam(project.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        // Only OWNER and ADMIN can create task lists
        if (membership.getRole() == TeamRole.MEMBER) {
            throw new TaskListException("Only team owners and admins can create task lists");
        }

        // Calculate position if not provided
        Double position = request.getPosition();
        if (position == null) {
            position = taskListRepository.findMaxPositionByProjectId(projectId)
                    .map(max -> max + 1000.0)
                    .orElse(1000.0);
        }

        TaskList taskList = TaskList.builder()
                .project(project)
                .name(request.getName())
                .position(position)
                .isDeleted(false)
                .build();

        TaskList saved = taskListRepository.save(taskList);
        return mapper.toResponse(saved);
    }

    public List<TaskListResponse> getProjectTaskLists(UUID projectId, UUID userId) {
        Project project = getProject(projectId);
        Team team = getTeam(project.getTeamId());
        verifyTeamMembership(team, userId);

        return taskListRepository
                .findByProject_IdAndIsDeletedFalseOrderByPositionAsc(projectId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public TaskListResponse getTaskListById(UUID listId, UUID userId) {
        TaskList taskList = getTaskList(listId);

        Project project = getProject(taskList.getProject().getId());
        Team team = getTeam(project.getTeamId());
        verifyTeamMembership(team, userId);

        return mapper.toResponse(taskList);
    }

    @Transactional
    public TaskListResponse updateTaskList(UUID listId, TaskListUpdateRequest request, User user) {
        TaskList taskList = getTaskList(listId);

        Project project = getProject(taskList.getProject().getId());
        Team team = getTeam(project.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        if (membership.getRole() == TeamRole.MEMBER) {
            throw new TaskListException("Only team owners and admins can update task lists");
        }

        // Update fields
        if (request.getName() != null) {
            taskList.setName(request.getName());
        }
        if (request.getPosition() != null) {
            taskList.setPosition(request.getPosition());
        }

        TaskList updated = taskListRepository.save(taskList);
        return mapper.toResponse(updated);
    }

    @Transactional
    public void deleteTaskList(UUID listId, User user) {
        TaskList taskList = getTaskList(listId);

        Project project = getProject(taskList.getProject().getId());
        Team team = getTeam(project.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        if (membership.getRole() == TeamRole.MEMBER) {
            throw new TaskListException("Only team owners and admins can delete task lists");
        }

        taskList.setDeleted(true);
        taskListRepository.save(taskList);
    }

    @Transactional
    public void reorderTaskLists(UUID projectId, List<UUID> orderedListIds, User user) {
        Project project = getProject(projectId);
        Team team = getTeam(project.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        if (membership.getRole() == TeamRole.MEMBER) {
            throw new TaskListException("Only team owners and admins can reorder task lists");
        }

        // Fetch all lists in one query
        List<TaskList> allLists = taskListRepository.findByProject_IdAndIsDeletedFalseOrderByPositionAsc(projectId);
        Map<UUID, TaskList> listMap = allLists.stream()
                .collect(Collectors.toMap(TaskList::getId, tl -> tl));

        // Update positions in memory
        for (int i = 0; i < orderedListIds.size(); i++) {
            UUID listId = orderedListIds.get(i);
            TaskList taskList = listMap.get(listId);

            if (taskList == null) {
                throw new TaskListNotFoundException("Task list not found with id: " + listId);
            }
            if (!taskList.getProject().getId().equals(projectId)) {
                throw new TaskListException("Task list does not belong to this project");
            }

            taskList.setPosition((i + 1) * 1000.0);
        }

        // Batch save all at once
        taskListRepository.saveAll(allLists);
    }

    // Helper methods
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

    private Team getTeam(UUID teamId) {
        return teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found with id: " + teamId));
    }

    private TeamMembership verifyTeamMembership(Team team, UUID userId) {
        return team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));
    }
}