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
import com.collabflow.domain.team.repository.TeamMembershipRepository;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.exception.UserNotFoundException;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.UserRepository;
import com.collabflow.events.model.DomainEvent;
import com.collabflow.events.model.DomainEventType;
import com.collabflow.events.publisher.DomainEventPublisher;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;
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
@Transactional(readOnly = true)
public class TeamService {

    private final TeamMembershipRepository teamMembershipRepository;
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;


    private final TeamRepository teamRepository;
    private final TeamInviteRepository teamInviteRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher domainEventPublisher;


    @Cacheable(cacheNames = "teamsByUser", key = "#id")
    public List<Team> getTeams(UUID id){
        return teamRepository.findAllByUserId(id);
    }

    @Cacheable(cacheNames = "teamByIdAndUser", key = "#teamId.toString() + ':' + #userId.toString()")
    public Team getTeamById(UUID teamId, UUID userId) {
        // Use fetch-join query to avoid N+1
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
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
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
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
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
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
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
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


    @Cacheable(cacheNames = "teamMembersByTeamAndUser", key = "#teamId.toString() + ':' + #userId.toString()")
    public Set<TeamMembership> getTeamMemberships(UUID userId, UUID teamId) {
        Team team = getTeam(teamId);

        boolean isMember = team.getTeamMemberships().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));

        if (!isMember) {
            throw new TeamException("User is not a member of this team");
        }

        // 🚨 CHANGE: Return the Set of TeamMembership objects, not just the Users.
        return team.getTeamMemberships();
    }

    @Transactional
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
    public String createInviteLink(UUID teamId, UUID userId) {
        Team team = getTeam(teamId);

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

        TeamInvite savedInvite = teamInviteRepository.save(invite);

        domainEventPublisher.publish(DomainEvent.builder()
            .eventType(DomainEventType.TEAM_MEMBER_INVITED)
            .aggregateType("TeamInvite")
            .aggregateId(savedInvite.getId())
            .actorId(membership.getUser().getId())
            .actorUsername(membership.getUser().getUsername())
            .teamId(team.getId())
            .payload(java.util.Map.of(
                "teamName", team.getName(),
                "inviteToken", savedInvite.getToken(),
                "expiresAt", savedInvite.getExpiresAt().toString()
            ))
            .build());

        // Return the invite URL
        return String.format("%s/invite/%s", frontendBaseUrl, invite.getToken());
    }

    @Transactional
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
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
        TeamMembershipId membershipId = new TeamMembershipId();
        membershipId.setTeamId(team.getId());
        membershipId.setUserId(user.getId());
        membership.setId(membershipId);
        membership.setTeam(team);
        membership.setUser(user);
        membership.setRole(TeamRole.MEMBER);
        membership.setJoinedAt(Instant.now());

        team.getTeamMemberships().add(membership);

        Team savedTeam = teamRepository.save(team);

        domainEventPublisher.publish(DomainEvent.builder()
            .eventType(DomainEventType.TEAM_MEMBER_JOINED)
            .aggregateType("TeamMembership")
            .aggregateId(membership.getId().getUserId())
            .actorId(user.getId())
            .actorUsername(user.getUsername())
            .teamId(team.getId())
            .payload(java.util.Map.of(
                "teamName", team.getName(),
                "userId", user.getId().toString(),
                "username", user.getUsername()
            ))
            .build());

        return savedTeam;
    }




    @Transactional
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
    public void updateMemberRole(UUID teamId, UUID targetUserId, String newRoleStr, User actingUser) {

        Team team = getTeam(teamId);

        TeamRole newRole = TeamRole.valueOf(newRoleStr.toUpperCase());

        // Prevent assigning OWNER role through this method — use transferOwnership instead
        if (newRole == TeamRole.OWNER) {
            throw new TeamException("Cannot assign OWNER role directly. Use ownership transfer instead.");
        }

        // Find the acting user's membership
        TeamMembership actingMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(actingUser.getId()))
                .findFirst()
                .orElseThrow(() -> new TeamException("Acting user is not a member of this team"));

// Find the target user's membership
        TeamMembership targetMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(targetUserId))
                .findFirst()
                .orElseThrow(() -> new TeamException("Target user is not a member of this team"));

        // Only OWNER can promote/demote admins
        if (actingMembership.getRole() != TeamRole.OWNER) {
            throw new TeamException("Only the team owner can change member roles");
        }

        // Prevent owner from demoting themselves
        if (targetMembership.getRole() == TeamRole.OWNER) {
            throw new TeamException("Cannot change the role of the team owner");
        }

        targetMembership.setRole(newRole);
        teamMembershipRepository.save(targetMembership);
    }


    @Transactional
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
    public void transferOwnership(UUID teamId, UUID newOwnerId, User currentUser) {

        Team team = getTeam(teamId);


        // Find the acting user's membership
        TeamMembership actingMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow(() -> new TeamException("Acting user is not a member of this team"));

// Find the target user's membership
        TeamMembership newOwnerMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(newOwnerId))
                .findFirst()
                .orElseThrow(() -> new TeamException("Target user is not a member of this team"));


        if (actingMembership.getRole() != TeamRole.OWNER) {
            throw new TeamException("Only the team owner can change member roles");
        }


        newOwnerMembership.setRole(TeamRole.OWNER);
        actingMembership.setRole(TeamRole.ADMIN);

        teamMembershipRepository.save(actingMembership);
        teamMembershipRepository.save(newOwnerMembership);


    }


    @Transactional
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
    public void removeMember(UUID teamId, UUID userId, User currentUser) {
        Team team = getTeam(teamId);

        // Find the acting user's membership
        TeamMembership actingMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow(() -> new TeamException("Acting user is not a member of this team"));

        TeamMembership targetMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("Target user is not a member of this team"));

        if (targetMembership.getRole() == TeamRole.OWNER) {
            throw new TeamException("You cannot remove the team owner");
        }

        if (actingMembership.getRole() == TeamRole.MEMBER) {
            throw new TeamException("You do not have permission to remove members");
        }

        // Admin can only remove members
        if (actingMembership.getRole() == TeamRole.ADMIN && targetMembership.getRole() != TeamRole.MEMBER) {
            throw new TeamException("Admins can only remove members");
        }

        // ✅ Use the custom delete method
        teamMembershipRepository.deleteByTeamIdAndUserId(teamId, userId);
    }

    @Transactional
        @Caching(evict = {
            @CacheEvict(cacheNames = "teamsByUser", allEntries = true),
            @CacheEvict(cacheNames = "teamByIdAndUser", allEntries = true),
            @CacheEvict(cacheNames = "teamMembersByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "projectsByTeamAndUser", allEntries = true),
            @CacheEvict(cacheNames = "taskListsByProjectAndUser", allEntries = true)
        })
    public void leaveTeam(UUID teamId, User currentUser) {
        Team team = getTeam(teamId);

        // Find the acting user's membership
        TeamMembership currentUserMembership = team.getTeamMemberships().stream()
                .filter(m -> m.getUser().getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow(() -> new TeamException("Acting user is not a member of this team"));

        if (currentUserMembership.getRole() == TeamRole.OWNER) {
            throw new TeamException("Owner cannot leave the team. Transfer ownership first.");
        }

        // ✅ Use the custom delete method
        teamMembershipRepository.deleteByTeamIdAndUserId(teamId, currentUser.getId());
    }

    private Team getTeam(UUID teamId) {
        return teamRepository.findByIdWithMembershipsAndUsers(teamId).orElseThrow(() -> new TeamNotFoundException("Team not found"));
    }
}

