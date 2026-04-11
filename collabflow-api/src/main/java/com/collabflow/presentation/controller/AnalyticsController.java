package com.collabflow.presentation.controller;

import com.collabflow.domain.analytics.dto.UsageAnalyticsResponse;
import com.collabflow.domain.analytics.service.UsageAnalyticsService;
import com.collabflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final UsageAnalyticsService usageAnalyticsService;

    @GetMapping("/usage")
    public ResponseEntity<UsageAnalyticsResponse> getUsage(
            @RequestParam UUID teamId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UsageAnalyticsResponse response = usageAnalyticsService.getUsage(
                teamId,
                projectId,
                days,
                userDetails.getUser().getId()
        );

        return ResponseEntity.ok(response);
    }
}
