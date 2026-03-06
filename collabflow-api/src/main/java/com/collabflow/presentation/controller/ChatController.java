package com.collabflow.presentation.controller;

import com.collabflow.domain.chat.dto.ChatMessageResponse;
import com.collabflow.domain.chat.service.ChatService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST endpoint for chat message history.
 *
 * <p>Real-time messaging flows through the WebSocket (STOMP) layer –
 * this controller is exclusively for fetching persisted messages.</p>
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Returns the latest messages for a project chat.
     *
     * @param projectId the project whose chat history to fetch
     * @param limit     max number of messages (default 20, max 50)
     */
    @GetMapping("/project/{projectId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        List<ChatMessageResponse> messages = chatService.getLatestMessages(projectId, user.getId(), limit);
        return ResponseEntity.ok(messages);
    }
}
