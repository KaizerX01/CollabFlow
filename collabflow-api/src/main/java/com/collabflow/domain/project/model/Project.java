package com.collabflow.domain.project.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "team_id", nullable = false)
    private UUID teamId;

    private String name;

    private String description;

    @Column(name = "is_deleted")
    private boolean deleted = false;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
