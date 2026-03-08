package com.collabflow.domain.activity.repository;

import com.collabflow.domain.activity.model.ActivityFeedItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityFeedItemRepository extends JpaRepository<ActivityFeedItem, UUID> {
    boolean existsByEventId(UUID eventId);

    List<ActivityFeedItem> findByTeamIdOrderByOccurredAtDesc(UUID teamId, Pageable pageable);
}
