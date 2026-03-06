package com.collabflow.presentation.controller;

import com.collabflow.domain.task.dto.TaskCreateRequest;
import com.collabflow.domain.task.dto.TaskMoveRequest;
import com.collabflow.domain.task.dto.TaskResponse;
import com.collabflow.domain.task.dto.TaskUpdateRequest;
import com.collabflow.domain.task.service.TaskService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/task-list/{taskListId}")
    public ResponseEntity<List<TaskResponse>> getTaskListTasks(
            @PathVariable UUID taskListId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<TaskResponse> tasks = taskService.getTaskListTasks(taskListId, user.getId());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<TaskResponse> tasks = taskService.getProjectTasks(projectId, user.getId());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        TaskResponse response = taskService.getTaskById(taskId, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/task-list/{taskListId}")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable UUID taskListId,
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        TaskResponse response = taskService.createTask(taskListId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        TaskResponse response = taskService.updateTask(taskId, request, userDetails.getUser());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{taskId}/move")
    public ResponseEntity<TaskResponse> moveTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskMoveRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        TaskResponse response = taskService.moveTask(
                taskId,
                request.getNewTaskListId(),
                request.getNewPosition(),
                userDetails.getUser()
        );
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{taskId}/toggle-complete")
    public ResponseEntity<TaskResponse> toggleComplete(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        TaskResponse response = taskService.toggleComplete(taskId, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        taskService.deleteTask(taskId, user);
        return ResponseEntity.noContent().build();
    }
}