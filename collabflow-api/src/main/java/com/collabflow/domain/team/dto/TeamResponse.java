package com.collabflow.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamResponse {
    private UUID id;

    private String name;

    private String description;

    private Instant createdAt;

    private Instant updatedAt;

}
