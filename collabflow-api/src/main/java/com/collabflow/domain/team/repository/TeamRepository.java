package com.collabflow.domain.team.repository;

import com.collabflow.domain.team.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {


    @Query("SELECT t from Team t join t.teamMemberships tm where tm.user.id= :id ORDER BY t.createdAt DESC")
    List<Team> findAllByUserId(UUID id);

    @Query("SELECT t FROM Team t LEFT JOIN FETCH t.teamMemberships tm LEFT JOIN FETCH tm.user WHERE t.id = :teamId")
    Optional<Team> findByIdWithMembershipsAndUsers(@Param("teamId") UUID teamId);
}
