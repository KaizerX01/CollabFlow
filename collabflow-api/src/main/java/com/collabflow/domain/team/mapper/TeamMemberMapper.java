package com.collabflow.domain.team.mapper;


import com.collabflow.domain.team.dto.TeamMemberResponse;
import com.collabflow.domain.team.model.TeamMembership;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TeamMemberMapper {
    @Mapping(source = "user.id", target = "id")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    TeamMemberResponse toDto(TeamMembership teamMembership);
}
