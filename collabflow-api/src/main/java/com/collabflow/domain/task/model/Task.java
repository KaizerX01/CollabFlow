package com.collabflow.domain.task.model;

import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.tasklist.model.TaskList;
import com.collabflow.domain.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UUID")
    private UUID id;

    // -----------------------------
    // RELATIONSHIPS
    // -----------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_list_id", nullable = false)
    private TaskList taskList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // -----------------------------
    // FIELDS
    // -----------------------------

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double position;   // for ordering tasks inside a column

    @Column(columnDefinition = "SMALLINT")
    private Short priority; // 0–5

    private Instant dueDate;

    private boolean isCompleted;
    private boolean isDeleted;

    @Version
    private Long version;

    // -----------------------------
    // TIMESTAMPS
    // -----------------------------

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.priority == null) this.priority = 0;
        if (this.position == null) this.position = 0.0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
