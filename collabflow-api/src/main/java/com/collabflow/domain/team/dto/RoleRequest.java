package com.collabflow.domain.team.dto;

import com.collabflow.domain.team.model.enums.TeamRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class RoleRequest {
    TeamRole role;
}
