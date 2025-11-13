package com.collabflow.domain.team.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TeamResponse {
    private UUID id;

    private String name;

    private String description;

    private Instant createdAt;

    private Instant updatedAt;

}
