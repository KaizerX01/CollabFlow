package com.collabflow.domain.tasklist.exception;

public class TaskListNotFoundException extends RuntimeException {
    public TaskListNotFoundException(String message) {
        super(message);
    }
}
