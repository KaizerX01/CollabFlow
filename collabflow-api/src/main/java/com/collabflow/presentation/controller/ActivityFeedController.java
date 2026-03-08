package com.collabflow.presentation.controller;

import com.collabflow.domain.activity.dto.ActivityFeedItemResponse;
import com.collabflow.domain.activity.service.ActivityFeedService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams/{teamId}/activity")
@RequiredArgsConstructor
public class ActivityFeedController {

    private final ActivityFeedService activityFeedService;

    @GetMapping
    public ResponseEntity<List<ActivityFeedItemResponse>> getTeamActivity(
            @PathVariable UUID teamId,
            @RequestParam(defaultValue = "30") int limit,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(activityFeedService.getTeamActivity(teamId, user.getId(), limit));
    }
}
