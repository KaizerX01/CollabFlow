package com.collabflow.domain.tasklist.mapper;

import com.collabflow.domain.tasklist.model.TaskList;
import com.collabflow.domain.tasklist.dto.TaskListResponse;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TaskListMapper {

    TaskListMapper INSTANCE = Mappers.getMapper(TaskListMapper.class);

    @Mapping(source = "project.id", target = "projectId")
    TaskListResponse toResponse(TaskList taskList);
}
