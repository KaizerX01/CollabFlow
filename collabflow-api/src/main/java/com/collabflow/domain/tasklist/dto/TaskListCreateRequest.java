package com.collabflow.domain.tasklist.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskListCreateRequest {
    /**
     * @deprecated projectId is now taken from the URL path variable.
     * Kept for backwards-compatibility but ignored by the service layer.
     */
    private UUID projectId;

    @NotBlank(message = "Name is required")
    private String name;

    private Double position;
}