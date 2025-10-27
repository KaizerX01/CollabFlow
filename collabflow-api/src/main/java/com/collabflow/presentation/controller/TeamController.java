package com.collabflow.presentation.controller;


import com.collabflow.domain.team.dto.TeamRequest;
import com.collabflow.domain.team.dto.TeamResponse;
import com.collabflow.domain.team.mapper.TeamMapper;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.service.Teamservice;
import com.collabflow.domain.user.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
public class TeamController {

    private final Teamservice teamservice;
    private final TeamMapper teamMapper;

    @GetMapping("/team")
    public ResponseEntity<List<TeamResponse>> findAll(Authentication authentication) {
        User user =  (User) authentication.getPrincipal();
        var teams = teamservice.getTeams(user.getId());
        List<TeamResponse> teamResponses = teams.stream()
                .map(teamMapper::toDto)
                .toList();

        return ResponseEntity.ok(teamResponses);

    }

    @PostMapping("/team")
    public ResponseEntity<TeamResponse> createTeam (Authentication authentication, @RequestBody @Valid TeamRequest req){
        User user =  (User) authentication.getPrincipal();
        var team = teamservice.addTeam(user,req);
    }
}
