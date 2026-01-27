package com.collabflow.domain.task.mapper;

import com.collabflow.domain.task.dto.TaskAssignmentResponse;
import com.collabflow.domain.task.dto.TaskResponse;
import com.collabflow.domain.task.model.Task;
import com.collabflow.domain.task.model.TaskAssignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    // Map main Task basic fields -> TaskResponse (assignees set in service)
    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "taskList.id", target = "taskListId")
    @Mapping(source = "createdBy.id", target = "createdBy")
    TaskResponse toResponse(Task task);

    // Map a TaskAssignment -> TaskAssignmentResponse
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    TaskAssignmentResponse toAssignmentResponse(TaskAssignment assignment);
}
