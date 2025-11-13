package com.collabflow.presentation.controller;

import com.collabflow.domain.team.dto.TeamRequest;
import com.collabflow.domain.team.dto.TeamResponse;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.mapper.TeamMapper;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.service.Teamservice;
import com.collabflow.domain.user.dto.UserResponse;
import com.collabflow.domain.user.mapper.UserMapper;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final Teamservice teamservice;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;

    @GetMapping
    public ResponseEntity<List<TeamResponse>> findAll(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            System.out.println("🎯 findAll endpoint hit!");
            System.out.println("👤 User: " + (userDetails != null ? userDetails.getUsername() : "null"));

            if (userDetails == null) {
                System.err.println("❌ UserDetails is null!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userDetails.getUser();
            System.out.println("✅ User ID: " + user.getId());

            var teams = teamservice.getTeams(user.getId());
            System.out.println("📋 Teams found: " + teams.size());

            List<TeamResponse> teamResponses = teams.stream()
                    .map(teamMapper::toDto)
                    .toList();

            System.out.println("✅ Returning " + teamResponses.size() + " teams");
            return ResponseEntity.ok(teamResponses);

        } catch (Exception e) {
            System.err.println("❌ ERROR in findAll: " + e.getClass().getName());
            System.err.println("❌ Message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }






    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserResponse>> findAllUsers(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var users = teamservice.getTeamUsers(user.getId(), id);
        var res = users.stream().map(userMapper::toDto).toList();

        return ResponseEntity.ok(res);
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid TeamRequest req) {

        User user = userDetails.getUser();
        var team = teamservice.addTeam(user, req);

        return ResponseEntity.ok(teamMapper.toDto(team));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> findById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            System.out.println("🎯 findById endpoint hit for team: " + id);

            User user = userDetails.getUser();
            Team team = teamservice.getTeamById(id, user.getId());

            return ResponseEntity.ok(teamMapper.toDto(team));

        } catch (Exception e) {
            System.err.println("❌ ERROR in findById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable UUID id,
            @RequestBody @Valid TeamRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var result = teamservice.updateTeam(id, user.getId(), req);

        return ResponseEntity.ok(teamMapper.toDto(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        teamservice.deleteTeam(id, user.getId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/invite")
    public ResponseEntity<Map<String, String>> createInvite(
            @PathVariable UUID teamId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        var inviteLink = teamservice.createInviteLink(teamId, user.getId());

        return ResponseEntity.ok(Map.of("inviteLink", inviteLink));
    }

    @PostMapping("/join/{token}")
    public ResponseEntity<TeamResponse> joinTeam(
            @PathVariable String token,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        Team team = teamservice.joinTeamByInvite(token, user.getId());

        return ResponseEntity.ok(teamMapper.toDto(team));
    }

    @ExceptionHandler(TeamNotFoundException.class)
    public ResponseEntity<String> handleTeamNotFoundException(TeamNotFoundException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(TeamException.class)
    public ResponseEntity<String> handleTeamException(TeamException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }
}