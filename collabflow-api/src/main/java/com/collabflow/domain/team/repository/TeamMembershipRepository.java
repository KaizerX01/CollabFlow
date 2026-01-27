package com.collabflow.domain.team.repository;

import com.collabflow.domain.team.model.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, UUID> {
    @Modifying
    @Query("DELETE FROM TeamMembership tm WHERE tm.id.teamId = :teamId AND tm.id.userId = :userId")
    void deleteByTeamIdAndUserId(@Param("teamId") UUID teamId, @Param("userId") UUID userId);
}
