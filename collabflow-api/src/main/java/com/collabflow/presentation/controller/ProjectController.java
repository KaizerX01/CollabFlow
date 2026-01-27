package com.collabflow.presentation.controller;

import com.collabflow.domain.project.dto.ProjectCreateRequest;
import com.collabflow.domain.project.dto.ProjectResponse;
import com.collabflow.domain.project.dto.ProjectUpdateRequest;
import com.collabflow.domain.project.exception.ProjectException;
import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.project.service.ProjectService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.messaging.handler.annotation.support.MethodArgumentTypeMismatchException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        ProjectResponse res = projectService.create(req, user);

        // Add null check - if service returns null, throw exception for 500 status
        if (res == null) {
            throw new RuntimeException("Failed to create project: service returned null");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        ProjectResponse res = projectService.findById(projectId, user.getId());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<ProjectResponse>> getTeamProjects(
            @PathVariable UUID teamId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<ProjectResponse> projects = projectService.findAllByTeam(teamId, user.getId());
        return ResponseEntity.ok(projects);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectUpdateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        ProjectResponse res = projectService.update(projectId, req, user);

        // Add null check - if service returns null, throw exception for 500 status
        if (res == null) {
            throw new RuntimeException("Failed to update project: service returned null");
        }

        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        projectService.delete(projectId, user);
        return ResponseEntity.noContent().build();
    }


    /**
     * Handles ProjectNotFoundException - returns 400 Bad Request
     */
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<String> handleProjectNotFound(ProjectNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    /**
     * Handles ProjectException - returns 401 Unauthorized
     */
    @ExceptionHandler(ProjectException.class)
    public ResponseEntity<String> handleProjectException(ProjectException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    /**
     * Handles invalid JSON parsing errors - returns 400 Bad Request
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Invalid request body: " + ex.getMostSpecificCause().getMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    /**
     * Handles type conversion errors (e.g., invalid UUID format) - returns 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid parameter '%s': %s",
                ex.getMessage(),
                ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    /**
     * Handles generic RuntimeException - returns 500 Internal Server Error
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}