package com.collabflow.domain.tasklist.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskListResponse {
    private UUID id;
    private UUID projectId;
    private String name;
    private double position;
    private boolean isDeleted;
    private Instant createdAt;
    private Instant updatedAt;
}
