package com.collabflow.domain.task.repository;

import com.collabflow.domain.task.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    // Tasks inside a list ordered
    List<Task> findByTaskList_IdAndIsDeletedFalseOrderByPositionAsc(UUID taskListId);

    // All tasks in project ordered
    List<Task> findByProject_IdAndIsDeletedFalseOrderByPositionAsc(UUID projectId);

    // Max position inside list
    @Query("""
           SELECT MAX(t.position)
           FROM Task t
           WHERE t.taskList.id = :taskListId
             AND t.isDeleted = false
           """)
    Optional<Double> findMaxPositionByTaskListId(@Param("taskListId") UUID taskListId);

    // Counting helpers
    long countByTaskList_IdAndIsDeletedFalse(UUID taskListId);

    long countByProject_IdAndIsDeletedFalse(UUID projectId);

    // Tasks created by user
    List<Task> findByCreatedBy_IdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    // Upcoming deadlines (used for dashboard)
    List<Task> findByProject_IdAndIsCompletedFalseAndIsDeletedFalseOrderByDueDateAsc(UUID projectId);


}
