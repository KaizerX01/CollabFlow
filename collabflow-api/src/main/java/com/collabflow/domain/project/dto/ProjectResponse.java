package com.collabflow.domain.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private UUID teamId;
    private String name;
    private String description;
    private boolean isDeleted;
    private Instant createdAt;
    private Instant updatedAt;
}
