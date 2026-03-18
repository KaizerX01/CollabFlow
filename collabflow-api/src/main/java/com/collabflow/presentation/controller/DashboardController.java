package com.collabflow.presentation.controller;

import com.collabflow.domain.user.dto.DashboardResponse;
import com.collabflow.domain.user.service.DashboardService;
import com.collabflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DashboardResponse dashboard = dashboardService.getDashboard(userDetails.getUser().getId());
        return ResponseEntity.ok(dashboard);
    }
}
