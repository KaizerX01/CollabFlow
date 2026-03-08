package com.collabflow.domain.team.dto;


import com.collabflow.domain.team.model.enums.TeamRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private UUID id;
    private String username;
    private String email;
    private TeamRole role;
    private boolean online;
}
