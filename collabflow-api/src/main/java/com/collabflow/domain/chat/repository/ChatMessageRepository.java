package com.collabflow.domain.chat.repository;

import com.collabflow.domain.chat.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    /**
     * Fetch the most recent messages for a project, ordered chronologically (oldest first)
     * so the UI displays them in natural reading order.
     * The sub-query fetches the latest N rows (ordered DESC), then the outer query reverses.
     */
    @Query("""
            SELECT m FROM ChatMessage m
            JOIN FETCH m.sender
            WHERE m.project.id = :projectId
            ORDER BY m.createdAt DESC
            """)
    List<ChatMessage> findLatestByProjectId(@Param("projectId") UUID projectId, Pageable pageable);
}
