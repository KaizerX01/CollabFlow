package com.collabflow.domain.notification.repository;

import com.collabflow.domain.notification.model.InAppNotification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InAppNotificationRepository extends JpaRepository<InAppNotification, UUID> {

    boolean existsByEventIdAndRecipientId(UUID eventId, UUID recipientId);

    List<InAppNotification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    long countByRecipientIdAndIsReadFalse(UUID recipientId);

    Optional<InAppNotification> findByIdAndRecipientId(UUID id, UUID recipientId);

    @Modifying
    @Query("UPDATE InAppNotification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.isRead = false")
    int markAllReadByRecipientId(@Param("recipientId") UUID recipientId);
}
