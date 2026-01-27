package com.collabflow.domain.tasklist.repository;

import com.collabflow.domain.tasklist.model.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskListRepository extends JpaRepository<TaskList, UUID> {

    List<TaskList> findByProject_IdAndIsDeletedFalseOrderByPositionAsc(UUID projectId);

    @Query("SELECT MAX(tl.position) FROM TaskList tl WHERE tl.project.id = :projectId AND tl.isDeleted = false")
    Optional<Double> findMaxPositionByProjectId(@Param("projectId") UUID projectId);

    long countByProject_IdAndIsDeletedFalse(UUID projectId);
}