package com.collabflow.presentation.controller;

import com.collabflow.domain.search.dto.SearchResponse;
import com.collabflow.domain.search.service.WorkItemSearchService;
import com.collabflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final WorkItemSearchService workItemSearchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam UUID teamId,
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) List<String> types,
            @RequestParam(required = false, defaultValue = "20") Integer limit,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        SearchResponse response = workItemSearchService.search(teamId, q, types, limit, userDetails.getUser());
        return ResponseEntity.ok(response);
    }
}
