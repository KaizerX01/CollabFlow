package com.collabflow.config;

import com.collabflow.domain.presence.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketPresenceEventListener {

    private final PresenceService presenceService;

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        presenceService.markSessionOffline(sessionId);
        log.debug("WebSocket disconnected, presence updated for session {}", sessionId);
    }
}
