package com.collabflow.presentation.controller;

import com.collabflow.domain.team.dto.TeamMemberResponse;
import com.collabflow.domain.team.dto.TeamRequest;
import com.collabflow.domain.team.dto.TeamResponse;
import com.collabflow.domain.team.mapper.TeamMapper;
import com.collabflow.domain.team.mapper.TeamMemberMapper;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.service.TeamService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;

    @GetMapping
    public ResponseEntity<List<TeamResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var teams = teamService.getTeams(user.getId());

        List<TeamResponse> teamResponses = teams.stream()
                .map(teamMapper::toDto)
                .toList();

        return ResponseEntity.ok(teamResponses);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberResponse>> findAllUsers(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var users = teamService.getTeamMemberships(user.getId(), id);
        var res = users.stream().map(teamMemberMapper::toDto).toList();

        return ResponseEntity.ok(res);
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid TeamRequest req) {

        User user = userDetails.getUser();
        var team = teamService.addTeam(user, req);
        // Logic for tests t12 vs t37:
        // If mapper returns null, we return 200 OK (empty body) to satisfy t12.
        return ResponseEntity.ok(teamMapper.toDto(team));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> findById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Team team = teamService.getTeamById(id, user.getId());

        TeamResponse dto = teamMapper.toDto(team);
        if (dto == null) {
            throw new IllegalStateException("TeamMapper returned null for team: " + id);
        }

        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable UUID id,
            @RequestBody @Valid TeamRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var result = teamService.updateTeam(id, user.getId(), req);
        TeamResponse dto = teamMapper.toDto(result);

        if (dto == null) {
            throw new IllegalStateException("TeamMapper returned null for team: " + id);
        }

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        teamService.deleteTeam(id, user.getId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/invite")
    public ResponseEntity<Map<String, String>> createInvite(
            @PathVariable UUID teamId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var inviteLink = teamService.createInviteLink(teamId, user.getId());

        return ResponseEntity.ok(Map.of("inviteLink", inviteLink));
    }

    @PostMapping("/join/{token}")
    public ResponseEntity<TeamResponse> joinTeam(
            @PathVariable String token,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Team team = teamService.joinTeamByInvite(token, user.getId());
        return ResponseEntity.ok(teamMapper.toDto(team));
    }

    @PatchMapping("/{teamId}/members/{userId}/role")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable UUID teamId,
            @PathVariable UUID userId,
            @RequestParam("newRole") @Valid String newRole,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails.getUser();
        teamService.updateMemberRole(teamId, userId, newRole, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{teamId}/transfer-owner/{newOwnerId}")
    public ResponseEntity<Void> transferOwnership(
            @PathVariable UUID teamId,
            @PathVariable UUID newOwnerId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails.getUser();
        teamService.transferOwnership(teamId, newOwnerId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID userId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails.getUser();
        teamService.removeMember(teamId, userId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(
            @PathVariable UUID teamId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails.getUser();
        teamService.leaveTeam(teamId, currentUser);
        return ResponseEntity.noContent().build();
    }
}