package com.collabflow.domain.task.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskUpdateRequest {
    private String title;
    private String description;
    private Double position;
    private Short priority;
    private Instant dueDate;
    private Boolean isCompleted;
    private List<UUID> assigneeIds;
}

