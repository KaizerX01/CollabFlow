package com.collabflow.domain.chat.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Outbound DTO representing a persisted chat message, sent to clients via REST and WebSocket.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private UUID id;
    private UUID projectId;
    private UUID senderId;
    private String senderUsername;
    private String content;
    private Instant createdAt;
}
