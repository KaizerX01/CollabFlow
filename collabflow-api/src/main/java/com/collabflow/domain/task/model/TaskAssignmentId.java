package com.collabflow.domain.task.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class TaskAssignmentId implements Serializable {
    private static final long serialVersionUID = -471752241849194789L;
    @NotNull
    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        TaskAssignmentId entity = (TaskAssignmentId) o;
        return Objects.equals(this.userId, entity.userId) &&
                Objects.equals(this.taskId, entity.taskId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, taskId);
    }

}