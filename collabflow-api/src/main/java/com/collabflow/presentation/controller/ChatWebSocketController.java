package com.collabflow.presentation.controller;

import com.collabflow.domain.chat.dto.ChatMessageRequest;
import com.collabflow.domain.chat.dto.ChatMessageResponse;
import com.collabflow.domain.chat.service.ChatService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * STOMP WebSocket controller for real-time project chat.
 *
 * <ul>
 *   <li><b>Client sends</b> to: <code>/app/chat.send/{projectId}</code></li>
 *   <li><b>Client subscribes</b> to: <code>/topic/chat/{projectId}</code></li>
 * </ul>
 *
 * <p>The user's {@link Principal} is populated by {@link com.collabflow.config.WebSocketAuthConfig}
 * during the STOMP CONNECT handshake.</p>
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send/{projectId}")
    public void handleChatMessage(
            @DestinationVariable String projectId,
            @Valid @Payload ChatMessageRequest request,
            Principal principal) {

        CustomUserDetails userDetails = extractUserDetails(principal);
        User user = userDetails.getUser();

        UUID projectUUID = UUID.fromString(projectId);

        // Persist & authorise (service layer verifies team membership)
        ChatMessageResponse response = chatService.sendMessage(projectUUID, user, request);

        // Broadcast to all subscribers of this project's chat topic
        messagingTemplate.convertAndSend("/topic/chat/" + projectId, response);

        log.debug("📤 Broadcast chat message to /topic/chat/{} from {}", projectId, user.getUsername());
    }

    /**
     * Extracts {@link CustomUserDetails} from the STOMP session principal
     * set during the CONNECT handshake.
     */
    private CustomUserDetails extractUserDetails(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken authToken) {
            Object details = authToken.getPrincipal();
            if (details instanceof CustomUserDetails cud) {
                return cud;
            }
        }
        throw new IllegalStateException("Unable to resolve authenticated user from WebSocket session");
    }
}
