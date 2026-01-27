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
public class TaskResponse {
    private UUID id;
    private UUID projectId;
    private UUID taskListId;
    private String title;
    private String description;
    private double position;
    private Short priority;
    private Instant dueDate;
    private boolean isCompleted;
    private boolean isDeleted;
    private long version;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    private List<TaskAssignmentResponse> assignees;
}
