package com.collabflow.domain.team.service;


import com.collabflow.domain.team.dto.TeamRequest;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.model.TeamMembership;
import com.collabflow.domain.team.model.TeamMembershipId;
import com.collabflow.domain.team.model.enums.TeamRole;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.model.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class Teamservice {


    private final TeamRepository teamRepository;


    public List<Team> getTeams(UUID id){
        return teamRepository.findAllByUserId(id);
    }

    @Transactional
    public Team addTeam(User user, TeamRequest req) {
        // Create the team
        Team team = new Team();
        team.setName(req.getName());
        team.setDescription(req.getDescription());
        team.setCreatedAt(Instant.now());
        team.setUpdatedAt(Instant.now());

        // Create owner membership
        TeamMembership ownerMembership = new TeamMembership();

        // Set composite key
        TeamMembershipId membershipId = new TeamMembershipId();
        membershipId.setTeamId(team.getId()); // Will be null until team is saved
        membershipId.setUserId(user.getId());
        ownerMembership.setId(membershipId);

        // Set relationships
        ownerMembership.setTeam(team);
        ownerMembership.setUser(user);
        ownerMembership.setRole(TeamRole.OWNER);
        ownerMembership.setJoinedAt(Instant.now());

        // Add to team's collection
        team.getTeamMemberships().add(ownerMembership);

        // Save team (will cascade to membership if configured)
        return teamRepository.save(team);
    }
}
