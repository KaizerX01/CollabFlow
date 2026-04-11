package com.collabflow.domain.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultItemResponse {
    private String id;
    private String resourceType;
    private String resourceId;
    private String teamId;
    private String projectId;
    private String title;
    private String description;
    private String taskListName;
    private String actorUsername;
    private Integer priority;
    private Boolean completed;
    private Instant updatedAt;
    private Instant occurredAt;
}
