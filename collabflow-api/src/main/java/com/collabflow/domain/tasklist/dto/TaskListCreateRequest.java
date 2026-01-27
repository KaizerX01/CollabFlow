package com.collabflow.domain.tasklist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskListCreateRequest {
    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Name is required")
    private String name;

    private Double position;
}