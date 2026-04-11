package com.collabflow.domain.search.service;

import com.collabflow.domain.search.dto.SearchResponse;
import com.collabflow.domain.search.dto.SearchResultItemResponse;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkItemSearchService {

    private final ElasticsearchOperations operations;
    private final TeamRepository teamRepository;

    @Value("${app.search.max-results:50}")
    private int maxResults;

    public SearchResponse search(UUID teamId, String query, List<String> types, Integer limit, User user) {
        verifyTeamMembership(teamId, user.getId());

        int safeLimit = Math.max(1, Math.min(limit == null ? 20 : limit, maxResults));
        String normalizedQuery = query == null ? "" : query.trim();

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> {
                    b.filter(f -> f.term(t -> t.field("teamId").value(teamId.toString())));

                    if (types != null && !types.isEmpty()) {
                        b.filter(f -> f.terms(t -> t
                                .field("resourceType")
                                .terms(ts -> ts.value(types.stream().map(type ->
                                        co.elastic.clients.elasticsearch._types.FieldValue.of(type.toLowerCase(Locale.ROOT))
                                ).toList()))));
                    }

                    if (!normalizedQuery.isBlank()) {
                        b.must(m -> m.multiMatch(mm -> mm
                                .query(normalizedQuery)
                                .fields("title^3", "description^2", "taskListName", "actorUsername", "assignees")
                                .fuzziness("AUTO")));
                    }
                    return b;
                }))
                .withSort(Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("occurredAt")))
                .withPageable(PageRequest.of(0, safeLimit))
                .build();

        var hits = operations.search(nativeQuery, com.collabflow.domain.search.model.WorkItemDocument.class);

        List<SearchResultItemResponse> items = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .map(doc -> SearchResultItemResponse.builder()
                        .id(doc.getId())
                        .resourceType(doc.getResourceType())
                        .resourceId(doc.getResourceId())
                        .teamId(doc.getTeamId())
                        .projectId(doc.getProjectId())
                        .title(doc.getTitle())
                        .description(doc.getDescription())
                        .taskListName(doc.getTaskListName())
                        .actorUsername(doc.getActorUsername())
                        .priority(doc.getPriority())
                        .completed(doc.getCompleted())
                        .updatedAt(doc.getUpdatedAt())
                        .occurredAt(doc.getOccurredAt())
                        .build())
                .toList();

        return SearchResponse.builder()
                .query(normalizedQuery)
                .total((int) hits.getTotalHits())
                .items(items)
                .build();
    }

    private void verifyTeamMembership(UUID teamId, UUID userId) {
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamException("Team not found"));

        team.getTeamMemberships().stream()
                .filter(membership -> membership.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new TeamException("User is not a member of this team"));
    }
}
