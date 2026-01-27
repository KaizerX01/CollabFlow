package com.collabflow.domain.project.dto;

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
public class ProjectCreateRequest {

    @NotNull(message = "Team ID is required")
    private UUID teamId;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
}