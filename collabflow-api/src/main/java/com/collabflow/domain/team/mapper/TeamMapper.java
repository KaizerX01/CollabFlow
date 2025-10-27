package com.collabflow.domain.team.mapper;


import com.collabflow.domain.team.dto.TeamResponse;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface TeamMapper {
    TeamResponse toDto(Object team);
}
