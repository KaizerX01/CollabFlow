package com.collabflow.presentation;

import com.collabflow.domain.chat.exception.ChatException;
import com.collabflow.domain.project.exception.ProjectException;
import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.task.exception.TaskException;
import com.collabflow.domain.task.exception.TaskNotFoundException;
import com.collabflow.domain.tasklist.exception.TaskListException;
import com.collabflow.domain.tasklist.exception.TaskListNotFoundException;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.user.exception.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralised exception handling for all REST controllers.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── Not-Found exceptions → 404 ───────────────────────────────────

    @ExceptionHandler({
            ProjectNotFoundException.class,
            TaskNotFoundException.class,
            TaskListNotFoundException.class,
            TeamNotFoundException.class,
            UserNotFoundException.class
    })
    public ResponseEntity<Map<String, String>> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    // ─── Authorization / business-rule exceptions ───────────────────
    // These exceptions signal access denial or business rule violations.
    // We inspect the message to decide between 403 (permission) and 400 (bad request).

    @ExceptionHandler({
            ProjectException.class,
            TaskException.class,
            TaskListException.class,
            TeamException.class
    })
    public ResponseEntity<Map<String, String>> handleDomainException(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        // Permission-related messages → 403
        if (msg.contains("permission") || msg.contains("only") || msg.contains("cannot") || msg.contains("not a member")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", ex.getMessage()));
        }
        // Everything else → 400 BAD_REQUEST
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

    // ─── Chat exception → 400 ─────────────────────────────────────────

    @ExceptionHandler(ChatException.class)
    public ResponseEntity<Map<String, String>> handleChatException(ChatException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // ─── Validation errors → 400 ──────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            errors.put(field, error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }

    // ─── Malformed request body → 400 ─────────────────────────────────

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Malformed JSON request"));
    }

    // ─── Type mismatch (e.g. bad UUID) → 400 ─────────────────────────

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = String.format("Invalid value '%s' for parameter '%s'",
                ex.getValue(), ex.getName());
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    // ─── Unsupported media type → 415 ─────────────────────────────────

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleMediaType(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(Map.of("error", "Content type '" + ex.getContentType() + "' is not supported"));
    }

    // ─── Catch-all → 500 ──────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred"));
    }
}
