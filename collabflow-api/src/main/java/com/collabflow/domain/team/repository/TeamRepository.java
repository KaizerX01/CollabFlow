package com.collabflow.domain.team.repository;

import com.collabflow.domain.team.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {


    @Query("SELECT t from Team t join t.teamMemberships tm where tm.user.id= :id ORDER BY t.createdAt DESC")
    List<Team> findAllByUserId(UUID id);
}
