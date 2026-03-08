package com.collabflow.events.consumer;

import com.collabflow.domain.notification.service.NotificationService;
import com.collabflow.domain.team.repository.TeamRepository;
import com.collabflow.events.model.DomainEventType;
import com.collabflow.events.model.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationService notificationService;
    private final TeamRepository teamRepository;

    @KafkaListener(
            topics = "${app.events.topic.system}",
            groupId = "${app.events.consumer-groups.notification}"
    )
    public void consume(DomainEvent event) {
        if (event == null || event.getEventType() == null || event.getEventId() == null) {
            return;
        }

        NotificationBlueprint blueprint = buildBlueprint(event);
        if (blueprint == null) {
            return;
        }

        for (Recipient recipient : resolveRecipients(event)) {
            notificationService.createAndPush(
                    recipient.userId(),
                    recipient.username(),
                    event,
                    blueprint.title(),
                    blueprint.message(),
                    blueprint.route()
            );
        }

        log.info("[notification-service] event={} aggregate={} actor={}",
                event.getEventType(), event.getAggregateId(), event.getActorUsername());
    }

    private List<Recipient> resolveRecipients(DomainEvent event) {
        if (event.getEventType() == DomainEventType.USER_REGISTERED && event.getActorId() != null) {
            String username = event.getActorUsername() == null ? "user" : event.getActorUsername();
            return List.of(new Recipient(event.getActorId(), username));
        }

        if (event.getTeamId() == null) {
            return List.of();
        }

        return teamRepository.findByIdWithMembershipsAndUsers(event.getTeamId())
                .map(team -> {
                    List<Recipient> recipients = new ArrayList<>();
                    team.getTeamMemberships().forEach(membership -> {
                        UUID memberId = membership.getUser().getId();
                        // Skip self-notifications for team/project/task/chat events.
                        if (event.getActorId() != null && event.getActorId().equals(memberId)) {
                            return;
                        }
                        recipients.add(new Recipient(memberId, membership.getUser().getUsername()));
                    });
                    return recipients;
                })
                .orElse(List.of());
    }

    private NotificationBlueprint buildBlueprint(DomainEvent event) {
        String actor = safeActor(event);

        return switch (event.getEventType()) {
            case USER_REGISTERED -> new NotificationBlueprint(
                    "Welcome to CollabFlow",
                    "Your account is ready. Start by creating or joining a team.",
                    "/teams"
            );
            case TEAM_MEMBER_INVITED -> new NotificationBlueprint(
                    "New Team Invite Link",
                    actor + " created a team invite link.",
                    teamRoute(event)
            );
            case TEAM_MEMBER_JOINED -> new NotificationBlueprint(
                    "New Team Member",
                    actor + " joined your team.",
                    teamRoute(event)
            );
            case PROJECT_CREATED -> new NotificationBlueprint(
                    "Project Created",
                    actor + " created project \"" + payload(event, "projectName") + "\".",
                    projectRoute(event)
            );
            case TASK_CREATED -> new NotificationBlueprint(
                    "Task Created",
                    actor + " created task \"" + payload(event, "taskTitle") + "\".",
                    workspaceRoute(event)
            );
            case TASK_MOVED -> new NotificationBlueprint(
                    "Task Moved",
                    actor + " moved task \"" + payload(event, "taskTitle") + "\" to \""
                            + payload(event, "toTaskListName") + "\".",
                    workspaceRoute(event)
            );
            case CHAT_MESSAGE_SENT -> new NotificationBlueprint(
                    "New Chat Message",
                    actor + " sent a new project chat message.",
                    workspaceRoute(event)
            );
        };
    }

            private String teamRoute(DomainEvent event) {
            if (event.getTeamId() == null) {
                return "/teams";
            }
            return "/teams/" + event.getTeamId();
            }

            private String projectRoute(DomainEvent event) {
            if (event.getTeamId() == null || event.getProjectId() == null) {
                return "/teams";
            }
            return "/teams/" + event.getTeamId() + "/projects/" + event.getProjectId();
            }

            private String workspaceRoute(DomainEvent event) {
            if (event.getTeamId() == null || event.getProjectId() == null) {
                return "/teams";
            }
            return "/teams/" + event.getTeamId() + "/projects/" + event.getProjectId() + "/workspace";
            }

    private String safeActor(DomainEvent event) {
        if (event.getActorUsername() == null || event.getActorUsername().isBlank()) {
            return "Someone";
        }
        return event.getActorUsername();
    }

    private String payload(DomainEvent event, String key) {
        Object value = event.getPayload() == null ? null : event.getPayload().get(key);
        return value == null ? "Unknown" : value.toString();
    }

    private record Recipient(UUID userId, String username) {
    }

    private record NotificationBlueprint(String title, String message, String route) {
    }
}
