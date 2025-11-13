package com.collabflow.domain.team.repository;

import com.collabflow.domain.team.model.TeamInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInviteRepository extends JpaRepository<TeamInvite, UUID> {  // ✅ Entity first, ID second
    Optional<TeamInvite> findByTokenAndIsActiveTrue(String token);

    @Modifying
    @Query("UPDATE TeamInvite ti SET ti.isActive = false WHERE ti.team.id = :teamId AND ti.isActive = true")
    void deactivateExistingInvites(@Param("teamId") UUID teamId);
}