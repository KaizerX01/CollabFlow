package com.collabflow.domain.search.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "collabflow-work-items")
public class WorkItemDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String resourceType;

    @Field(type = FieldType.Keyword)
    private String resourceId;

    @Field(type = FieldType.Keyword)
    private String teamId;

    @Field(type = FieldType.Keyword)
    private String projectId;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Text)
    private String taskListName;

    @Field(type = FieldType.Keyword)
    private String actorUsername;

    @Field(type = FieldType.Keyword)
    private List<String> assignees;

    @Field(type = FieldType.Integer)
    private Integer priority;

    @Field(type = FieldType.Boolean)
    private Boolean completed;

    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Instant updatedAt;

    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Instant occurredAt;
}
