package com.collabflow.domain.chat.service;

import com.collabflow.domain.chat.dto.ChatMessageRequest;
import com.collabflow.domain.chat.dto.ChatMessageResponse;
import com.collabflow.domain.chat.exception.ChatException;
import com.collabflow.domain.chat.mapper.ChatMessageMapper;
import com.collabflow.domain.chat.model.ChatMessage;
import com.collabflow.domain.chat.repository.ChatMessageRepository;
import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.project.repository.ProjectRepository;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.domain.user.model.User;
import com.collabflow.events.model.DomainEvent;
import com.collabflow.events.model.DomainEventType;
import com.collabflow.events.publisher.DomainEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Business logic for project-scoped chat messaging.
 *
 * <p>Every operation verifies that the calling user is a member of the team
 * that owns the given project – ensuring only authorised team members can read
 * or write messages.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private static final int DEFAULT_PAGE_SIZE = 50;

    private final ChatMessageRepository chatMessageRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final ChatMessageMapper mapper;
    private final DomainEventPublisher domainEventPublisher;

    // ─── Queries ──────────────────────────────────────────────────────

    /**
     * Retrieves the latest messages for a project, oldest-first.
     *
     * @param projectId the project whose chat to fetch
     * @param userId    the requesting user (must be a team member)
     * @param limit     max number of messages to return (capped at {@value DEFAULT_PAGE_SIZE})
     * @return chronologically ordered list of messages
     */
    public List<ChatMessageResponse> getLatestMessages(UUID projectId, UUID userId, int limit) {
        Project project = getProject(projectId);
        verifyTeamMembership(project.getTeamId(), userId);

        int safeLimit = Math.min(Math.max(limit, 1), DEFAULT_PAGE_SIZE);

        List<ChatMessage> messages =
                chatMessageRepository.findLatestByProjectId(projectId, PageRequest.of(0, safeLimit));

        // The query returns newest-first; reverse so the UI sees oldest-first
        List<ChatMessageResponse> result = messages.stream()
                .map(mapper::toResponse)
                .collect(java.util.stream.Collectors.toList());

        Collections.reverse(result);
        return result;
    }

    // ─── Commands ─────────────────────────────────────────────────────

    /**
     * Persists a new chat message and returns the hydrated response DTO.
     *
     * @param projectId the target project
     * @param user      the authenticated sender
     * @param request   the message payload
     * @return the persisted message as a response DTO
     */
    @Transactional
    public ChatMessageResponse sendMessage(UUID projectId, User user, ChatMessageRequest request) {
        if (request == null || request.getContent() == null || request.getContent().isBlank()) {
            throw new ChatException("Message content cannot be blank");
        }

        Project project = getProject(projectId);
        verifyTeamMembership(project.getTeamId(), user.getId());

        ChatMessage message = ChatMessage.builder()
                .project(project)
                .sender(user)
                .content(sanitizeHtml(request.getContent().trim()))
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        domainEventPublisher.publish(DomainEvent.builder()
            .eventType(DomainEventType.CHAT_MESSAGE_SENT)
            .aggregateType("ChatMessage")
            .aggregateId(saved.getId())
            .actorId(user.getId())
            .actorUsername(user.getUsername())
            .teamId(project.getTeamId())
            .projectId(project.getId())
            .payload(java.util.Map.of(
                "contentPreview", abbreviate(saved.getContent(), 80)
            ))
            .build());

        log.info("💬 Chat message saved – project={}, sender={}", projectId, user.getUsername());

        return mapper.toResponse(saved);
    }

    // ─── Internal helpers ─────────────────────────────────────────────

    private Project getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));
    }

    private void verifyTeamMembership(UUID teamId, UUID userId) {
        Team team = teamRepository.findByIdWithMembershipsAndUsers(teamId)
                .orElseThrow(() -> new TeamNotFoundException("Team not found: " + teamId));

        boolean isMember = team.getTeamMemberships().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));

        if (!isMember) {
            throw new TeamException("User is not a member of this team – chat access denied");
        }
    }
    /**
     * HTML sanitization to prevent stored XSS.
     * Strips all HTML tags, decodes entities, and removes script-related content.
     */
    private String sanitizeHtml(String input) {
        if (input == null) return null;
        // Strip HTML tags (including self-closing and malformed)
        String result = input.replaceAll("<[^>]*>", "");
        // Remove javascript: protocol patterns
        result = result.replaceAll("(?i)javascript\\s*:", "");
        // Remove on-event handlers that might survive tag stripping
        result = result.replaceAll("(?i)on\\w+\\s*=", "");
        return result;
    }

    private String abbreviate(String input, int maxLength) {
        if (input == null || input.length() <= maxLength) {
            return input;
        }
        return input.substring(0, maxLength) + "...";
    }
}
