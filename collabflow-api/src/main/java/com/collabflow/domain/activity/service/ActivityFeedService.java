package com.collabflow.domain.activity.service;

import com.collabflow.domain.activity.dto.ActivityFeedItemResponse;
import com.collabflow.domain.activity.repository.ActivityFeedItemRepository;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityFeedService {

    private static final int MAX_LIMIT = 100;

    private final ActivityFeedItemRepository activityFeedItemRepository;
    private final TeamRepository teamRepository;

    public List<ActivityFeedItemResponse> getTeamActivity(UUID teamId, UUID userId, int limit) {
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found: " + teamId));

        boolean isMember = team.getTeamMemberships().stream()
                .anyMatch(membership -> membership.getUser().getId().equals(userId));

        if (!isMember) {
            throw new TeamException("User is not a member of this team");
        }

        int safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);

        return activityFeedItemRepository
                .findByTeamIdOrderByOccurredAtDesc(teamId, PageRequest.of(0, safeLimit))
                .stream()
                .map(item -> new ActivityFeedItemResponse(
                        item.getId(),
                        item.getEventId(),
                        item.getEventType(),
                        item.getActorId(),
                        item.getActorUsername(),
                        item.getTeamId(),
                        item.getProjectId(),
                        item.getMessage(),
                        item.getOccurredAt()
                ))
                .toList();
    }
}
