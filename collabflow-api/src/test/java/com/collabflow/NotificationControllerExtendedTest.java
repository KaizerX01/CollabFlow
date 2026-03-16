package com.collabflow;

import com.collabflow.domain.notification.dto.InAppNotificationResponse;
import com.collabflow.domain.notification.service.NotificationService;
import com.collabflow.domain.user.model.User;
import com.collabflow.events.model.DomainEventType;
import com.collabflow.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = com.collabflow.presentation.controller.NotificationController.class)
class NotificationControllerExtendedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
    }

    @Test
    @DisplayName("1 - GET /api/notifications returns recent notifications")
    void t01_listNotifications_success() throws Exception {
        InAppNotificationResponse n1 = new InAppNotificationResponse(
                UUID.randomUUID(),
                UUID.randomUUID(),
                DomainEventType.TASK_CREATED,
                "Task Created",
                "A new task was created",
                "/teams/t1/projects/p1/workspace",
                false,
                Instant.now()
        );

        InAppNotificationResponse n2 = new InAppNotificationResponse(
                UUID.randomUUID(),
                UUID.randomUUID(),
                DomainEventType.PROJECT_CREATED,
                "Project Created",
                "A new project was created",
                "/teams/t1/projects/p1",
                true,
                Instant.now()
        );

        when(notificationService.getNotifications(eq(testUser.getId()), eq(20))).thenReturn(List.of(n1, n2));

        mockMvc.perform(get("/api/notifications")
                        .with(user(new CustomUserDetails(testUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").value("Task Created"))
                .andExpect(jsonPath("$[1].read").value(true));
    }

    @Test
    @DisplayName("2 - GET /api/notifications/unread-count returns unread count")
    void t02_unreadCount_success() throws Exception {
        when(notificationService.getUnreadCount(eq(testUser.getId()))).thenReturn(7L);

        mockMvc.perform(get("/api/notifications/unread-count")
                        .with(user(new CustomUserDetails(testUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(7));
    }

    @Test
    @DisplayName("3 - PATCH /api/notifications/{id}/read marks one notification")
    void t03_markRead_success() throws Exception {
        UUID notificationId = UUID.randomUUID();
        InAppNotificationResponse updated = new InAppNotificationResponse(
                notificationId,
                UUID.randomUUID(),
                DomainEventType.CHAT_MESSAGE_SENT,
                "New Chat Message",
                "Someone sent a message",
                "/teams/t1/projects/p1/workspace",
                true,
                Instant.now()
        );

        when(notificationService.markRead(eq(testUser.getId()), eq(notificationId))).thenReturn(updated);

        mockMvc.perform(patch("/api/notifications/" + notificationId + "/read")
                        .with(user(new CustomUserDetails(testUser)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(notificationId.toString()))
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    @DisplayName("4 - PATCH /api/notifications/read-all marks all unread")
    void t04_markAllRead_success() throws Exception {
        when(notificationService.markAllRead(eq(testUser.getId()))).thenReturn(3);

        mockMvc.perform(patch("/api/notifications/read-all")
                        .with(user(new CustomUserDetails(testUser)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updated").value(3));

        verify(notificationService).markAllRead(eq(testUser.getId()));
    }
}
