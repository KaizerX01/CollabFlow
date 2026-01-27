package com.collabflow.domain.tasklist.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskListUpdateRequest {
    private String name;
    private Double position;
}