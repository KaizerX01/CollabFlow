package com.collabflow.domain.project.mapper;


import com.collabflow.domain.project.dto.ProjectCreateRequest;
import com.collabflow.domain.project.dto.ProjectResponse;
import com.collabflow.domain.project.dto.ProjectUpdateRequest;
import com.collabflow.domain.project.model.Project;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    ProjectResponse toResponse(Project project);

    Project toEntity(ProjectCreateRequest request);

    void updateProjectFromDto(ProjectUpdateRequest dto, @MappingTarget Project project);
}
