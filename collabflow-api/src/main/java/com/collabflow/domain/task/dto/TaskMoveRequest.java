package com.collabflow.domain.task.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskMoveRequest {
    @NotNull(message = "New task list ID is required")
    private UUID newTaskListId;

    @NotNull(message = "New position is required")
    private Double newPosition;
}