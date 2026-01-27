package com.collabflow.presentation.controller;

import com.collabflow.domain.project.exception.ProjectException;
import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.tasklist.dto.TaskListCreateRequest;
import com.collabflow.domain.tasklist.dto.TaskListResponse;
import com.collabflow.domain.tasklist.dto.TaskListUpdateRequest;
import com.collabflow.domain.tasklist.exception.TaskListException;
import com.collabflow.domain.tasklist.exception.TaskListNotFoundException;
import com.collabflow.domain.tasklist.service.TaskListService;
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
@RequestMapping("/api/task-lists")
@RequiredArgsConstructor
public class TaskListController {

    private final TaskListService taskListService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<TaskListResponse> createTaskList(
            @PathVariable UUID projectId,
            @Valid @RequestBody TaskListCreateRequest request,  // ✅ Added @Valid
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        TaskListResponse response = taskListService.createTaskList(projectId, request, user);

        // ✅ Add null check
        if (response == null) {
            throw new RuntimeException("Failed to create task list: service returned null");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskListResponse>> getProjectTaskLists(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<TaskListResponse> taskLists = taskListService.getProjectTaskLists(projectId, user.getId());
        return ResponseEntity.ok(taskLists);
    }

    @GetMapping("/{listId}")
    public ResponseEntity<TaskListResponse> getTaskList(
            @PathVariable UUID listId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        TaskListResponse response = taskListService.getTaskListById(listId, user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{listId}")
    public ResponseEntity<TaskListResponse> updateTaskList(
            @PathVariable UUID listId,
            @Valid @RequestBody TaskListUpdateRequest request,  // ✅ Added @Valid
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        TaskListResponse response = taskListService.updateTaskList(listId, request, user);

        // ✅ Add null check
        if (response == null) {
            throw new RuntimeException("Failed to update task list: service returned null");
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> deleteTaskList(
            @PathVariable UUID listId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        taskListService.deleteTaskList(listId, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/project/{projectId}/reorder")
    public ResponseEntity<Void> reorderTaskLists(
            @PathVariable UUID projectId,
            @RequestBody List<UUID> orderedListIds,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        taskListService.reorderTaskLists(projectId, orderedListIds, user);

        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<String> handleProjectNotFound(ProjectNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(ProjectException.class)
    public ResponseEntity<String> handleProjectException(ProjectException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    // TaskList exceptions - NEW
    @ExceptionHandler(TaskListNotFoundException.class)
    public ResponseEntity<String> handleTaskListNotFound(TaskListNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(TaskListException.class)
    public ResponseEntity<String> handleTaskListException(TaskListException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    // Validation and parsing exceptions
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Invalid request body: " + ex.getMostSpecificCause().getMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid parameter '%s': %s",
                ex.getMessage(),
                ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}