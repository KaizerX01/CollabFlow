package com.collabflow.domain.task.repository;

import com.collabflow.domain.task.model.TaskAssignment;
import com.collabflow.domain.task.model.TaskAssignmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, TaskAssignmentId> {

    List<TaskAssignment> findByTask_Id(UUID taskId);

    // Fetch assignments with users in a single round trip for multiple tasks
    @Query("""
           SELECT ta
           FROM TaskAssignment ta
           JOIN FETCH ta.user u
           WHERE ta.task.id IN :taskIds
           """)
    List<TaskAssignment> findByTask_IdInWithUser(@Param("taskIds") List<UUID> taskIds);

    void deleteByTask_IdAndUser_Id(UUID taskId, UUID userId);

    boolean existsByTask_IdAndUser_Id(UUID taskId, UUID userId);
}
