package com.collabflow.domain.task.repository;

import com.collabflow.domain.task.model.TaskAssignment;
import com.collabflow.domain.task.model.TaskAssignmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, TaskAssignmentId> {

    List<TaskAssignment> findByTask_Id(UUID taskId);

    void deleteByTask_IdAndUser_Id(UUID taskId, UUID userId);

    boolean existsByTask_IdAndUser_Id(UUID taskId, UUID userId);
}
