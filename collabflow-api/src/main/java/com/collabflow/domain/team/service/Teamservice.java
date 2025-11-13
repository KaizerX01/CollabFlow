package com.collabflow.domain.team.service;


import com.collabflow.domain.team.dto.TeamRequest;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.model.TeamInvite;
import com.collabflow.domain.team.model.TeamMembership;
import com.collabflow.domain.team.model.TeamMembershipId;
import com.collabflow.domain.team.model.enums.TeamRole;
import com.collabflow.domain.team.repository.TeamInviteRepository;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.exception.UserNotFoundException;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Teamservice {

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;


    private final TeamRepository teamRepository;
    private final TeamInviteRepository teamInviteRepository;
    private final UserRepository userRepository;


    public List<Team> getTeams(UUID id){
        return teamRepository.findAllByUserId(id);
    }

    public Team getTeamById(UUID teamId, UUID userId) {
        // Find the team
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found with id: " + teamId));

        // Verify user has access to this team (is a member)
        boolean isMember = team.getTeamMemberships().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));

        if (!isMember) {
            throw new TeamException("User is not a member of this team");
        }

        return team;
    }

    @Transactional
    public Team addTeam(User user, TeamRequest req) {
        // Step 1: Create and save the team first
        Team team = new Team();
        team.setName(req.getName());
        team.setDescription(req.getDescription());
        team.setCreatedAt(Instant.now());
        team.setUpdatedAt(Instant.now());

        team = teamRepository.save(team); // now team has an ID and is managed

        // Step 2: Create owner membership
        TeamMembership ownerMembership = new TeamMembership();
        TeamMembershipId membershipId = new TeamMembershipId();
        membershipId.setTeamId(team.getId());
        membershipId.setUserId(user.getId());
        ownerMembership.setId(membershipId);

        ownerMembership.setTeam(team);
        ownerMembership.setUser(user);
        ownerMembership.setRole(TeamRole.OWNER);
        ownerMembership.setJoinedAt(Instant.now());

        // Step 3: Add to team’s memberships
        team.getTeamMemberships().add(ownerMembership);

        // Step 4: Save again (cascade will handle TeamMembership)
        return teamRepository.save(team);
    }



    @Transactional
    public Team updateTeam(UUID teamId, UUID userId, TeamRequest req) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found"));

        // Verify user has permission (is owner or admin)
        TeamMembership membership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));

        if (membership.getRole() != TeamRole.OWNER && membership.getRole() != TeamRole.ADMIN) {
            throw new TeamException("User does not have permission to update this team");
        }

        // Update team fields
        if(req.getName()!=null){
            team.setName(req.getName());
        }
        if(req.getDescription()!=null){
            team.setDescription(req.getDescription());
        }
        team.setUpdatedAt(Instant.now());

        return teamRepository.save(team);
    }

    @Transactional
    public void deleteTeam(UUID teamId, UUID userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found"));

        // Verify user is the owner
        TeamMembership membership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));

        if (membership.getRole() != TeamRole.OWNER) {
            throw new TeamException("Only the team owner can delete the team");
        }

        teamRepository.delete(team);
    }


    public Set<User> getTeamUsers(UUID userId, UUID teamId) {
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found"));

        boolean isMember = team.getTeamMemberships().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));

        if (!isMember) {
            throw new TeamException("User is not a member of this team");
        }

        return team.getTeamMemberships().stream().map(TeamMembership::getUser).collect(Collectors.toSet());

    }

    @Transactional
    public String createInviteLink(UUID teamId, UUID userId) {
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found"));

        TeamMembership membership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));

        if (membership.getRole() != TeamRole.OWNER) {
            throw new TeamException("Only the team owner can create the invite link");
        }


        teamInviteRepository.deactivateExistingInvites(teamId);

        // Create new invite
        TeamInvite invite = new TeamInvite();
        invite.setTeam(team);
        invite.setInvitedBy(membership.getUser());
        invite.setToken(UUID.randomUUID().toString());
        invite.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS)); // 7 days expiry
        invite.setIsActive(true);
        invite.setCreatedAt(Instant.now());

        teamInviteRepository.save(invite);

        // Return the invite URL
        return String.format("%s/invite/%s", frontendBaseUrl, invite.getToken());
    }

    @Transactional
    public Team joinTeamByInvite(String token, UUID userId) {
        TeamInvite invite = teamInviteRepository.findByTokenAndIsActiveTrue(token)
                .orElseThrow(() -> new TeamException("Invalid or expired invite link"));

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new TeamException("Invite link has expired");
        }

        Team team = invite.getTeam();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if already a member
        boolean alreadyMember = team.getTeamMemberships().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));

        if (alreadyMember) {
            throw new TeamException("You are already a member of this team");
        }

        // Add user as member
        TeamMembership membership = new TeamMembership();
        membership.setTeam(team);
        membership.setUser(user);
        membership.setRole(TeamRole.MEMBER);
        membership.setJoinedAt(Instant.now());

        team.getTeamMemberships().add(membership);

        invite.setIsActive(false);
        teamInviteRepository.save(invite);

        teamRepository.save(team);

        return team;
    }



}
