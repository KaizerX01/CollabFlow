package com.collabflow.domain.project.service;

import com.collabflow.domain.project.dto.ProjectCreateRequest;
import com.collabflow.domain.project.dto.ProjectResponse;
import com.collabflow.domain.project.dto.ProjectUpdateRequest;
import com.collabflow.domain.project.exception.ProjectException;
import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.project.mapper.ProjectMapper;
import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.project.repository.ProjectRepository;
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

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper mapper;

    @Transactional
    public ProjectResponse create(ProjectCreateRequest request, User user) {
        // Validate input
        if (request == null) {
            throw new IllegalArgumentException("Project create request cannot be null");
        }
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        // Verify user is a member of the team
        Team team = getTeam(request.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        // Only OWNER and ADMIN can create projects
        if (membership.getRole() == TeamRole.MEMBER) {
            throw new ProjectException("Only team owners and admins can create projects");
        }

        Project project = mapper.toEntity(request);
        if (project == null) {
            throw new IllegalStateException("Mapper failed to create project entity");
        }

        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());

        Project saved = projectRepository.save(project);
        if (saved == null) {
            throw new IllegalStateException("Failed to save project");
        }

        ProjectResponse response = mapper.toResponse(saved);
        if (response == null) {
            throw new IllegalStateException("Mapper failed to create project response");
        }

        return response;
    }

    public ProjectResponse findById(UUID projectId, UUID userId) {
        Project project = getProject(projectId);

        // Verify user has access to this project's team
        Team team = getTeam(project.getTeamId());
        verifyTeamMembership(team, userId);

        return mapper.toResponse(project);
    }

    public List<ProjectResponse> findAllByTeam(UUID teamId, UUID userId) {
        // Verify user is a member of the team
        Team team = getTeam(teamId);
        verifyTeamMembership(team, userId);

        List<Project> projects = projectRepository.findAllByTeamIdAndDeletedFalse(teamId);
        return projects.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse update(UUID projectId, ProjectUpdateRequest request, User user) {
        // Validate input
        if (request == null) {
            throw new IllegalArgumentException("Project update request cannot be null");
        }
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Project project = getProject(projectId);

        // Verify user has permission (is owner or admin of the team)
        Team team = getTeam(project.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        if (membership.getRole() == TeamRole.MEMBER) {
            throw new ProjectException("Only team owners and admins can update projects");
        }

        mapper.updateProjectFromDto(request, project);
        project.setUpdatedAt(Instant.now());

        Project updated = projectRepository.save(project);
        if (updated == null) {
            throw new IllegalStateException("Failed to save updated project");
        }

        ProjectResponse response = mapper.toResponse(updated);
        if (response == null) {
            throw new IllegalStateException("Mapper failed to create project response");
        }

        return response;
    }

    @Transactional
    public void delete(UUID projectId, User user) {
        // Validate input
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Project project = getProject(projectId);

        // Verify user has permission (is owner or admin of the team)
        Team team = getTeam(project.getTeamId());
        TeamMembership membership = verifyTeamMembership(team, user.getId());

        if (membership.getRole() == TeamRole.MEMBER) {
            throw new ProjectException("Only team owners and admins can delete projects");
        }

        project.setDeleted(true);
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
    }

    // Helper methods
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