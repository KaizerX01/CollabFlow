package com.collabflow.presentation.controller;

import com.collabflow.domain.tasklist.dto.TaskListCreateRequest;
import com.collabflow.domain.tasklist.dto.TaskListResponse;
import com.collabflow.domain.tasklist.dto.TaskListUpdateRequest;
import com.collabflow.domain.tasklist.service.TaskListService;
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
}