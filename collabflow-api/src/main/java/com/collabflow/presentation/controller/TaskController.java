package com.collabflow.presentation.controller;

import com.collabflow.domain.task.dto.TaskCreateRequest;
import com.collabflow.domain.task.dto.TaskMoveRequest;
import com.collabflow.domain.task.dto.TaskResponse;
import com.collabflow.domain.task.dto.TaskUpdateRequest;
import com.collabflow.domain.task.exception.TaskException;
import com.collabflow.domain.task.exception.TaskNotFoundException;
import com.collabflow.domain.task.service.TaskService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

        if (response == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        TaskResponse response = taskService.updateTask(taskId, request, userDetails.getUser());

        if (response == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

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

        if (response == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

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

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<String> handleTaskNotFoundException(TaskNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(TaskException.class)
    public ResponseEntity<String> handleTaskException(TaskException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid value '%s' for parameter '%s'",
                ex.getValue(), ex.getName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Malformed JSON request");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<String> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body("Content type '" + ex.getContentType() + "' is not supported");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while processing your request");
    }
}