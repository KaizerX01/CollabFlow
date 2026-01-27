package com.collabflow;

import com.collabflow.domain.task.dto.TaskCreateRequest;
import com.collabflow.domain.task.dto.TaskMoveRequest;
import com.collabflow.domain.task.dto.TaskResponse;
import com.collabflow.domain.task.dto.TaskUpdateRequest;
import com.collabflow.domain.task.exception.TaskException;
import com.collabflow.domain.task.exception.TaskNotFoundException;
import com.collabflow.domain.task.mapper.TaskMapper;
import com.collabflow.domain.task.model.Task;
import com.collabflow.domain.task.service.TaskService;
import com.collabflow.domain.user.model.User;
import com.collabflow.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@WebMvcTest(controllers = com.collabflow.presentation.controller.TaskController.class)
class TaskControllerExtendedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @MockBean
    private TaskMapper taskMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private CustomUserDetails testUserDetails;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");

        testUserDetails = new CustomUserDetails(testUser);

        var auth = new UsernamePasswordAuthenticationToken(
                testUserDetails,
                null,
                testUserDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("1 - POST /api/tasks/task-list/{taskListId} creates task")
    void t01_createTask_success() throws Exception {
        UUID taskListId = UUID.randomUUID();
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("New Task");
        request.setDescription("Task description");

        TaskResponse response = new TaskResponse();
        response.setId(UUID.randomUUID());
        response.setTitle("New Task");
        response.setDescription("Task description");
        response.setCompleted(false);
        response.setCreatedAt(Instant.now());

        when(taskService.createTask(eq(taskListId), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Task"))
                .andExpect(jsonPath("$.completed").value(false));
    }

    @Test
    @DisplayName("2 - GET /api/tasks/task-list/{taskListId} returns tasks")
    void t02_getTaskListTasks_success() throws Exception {
        UUID taskListId = UUID.randomUUID();
        TaskResponse t1 = new TaskResponse();
        t1.setId(UUID.randomUUID());
        t1.setTitle("Task 1");
        t1.setCompleted(false);

        TaskResponse t2 = new TaskResponse();
        t2.setId(UUID.randomUUID());
        t2.setTitle("Task 2");
        t2.setCompleted(true);

        when(taskService.getTaskListTasks(eq(taskListId), eq(testUser.getId())))
                .thenReturn(List.of(t1, t2));

        mockMvc.perform(get("/api/tasks/task-list/" + taskListId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").value("Task 1"))
                .andExpect(jsonPath("$[1].title").value("Task 2"));
    }

    @Test
    @DisplayName("3 - GET /api/tasks/task-list/{taskListId} returns empty list")
    void t03_getTaskListTasks_empty() throws Exception {
        UUID taskListId = UUID.randomUUID();
        when(taskService.getTaskListTasks(eq(taskListId), eq(testUser.getId())))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/tasks/task-list/" + taskListId))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    @DisplayName("4 - GET /api/tasks/project/{projectId} returns all project tasks")
    void t04_getProjectTasks_success() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskResponse t1 = new TaskResponse();
        t1.setId(UUID.randomUUID());
        t1.setTitle("Project Task 1");

        TaskResponse t2 = new TaskResponse();
        t2.setId(UUID.randomUUID());
        t2.setTitle("Project Task 2");

        when(taskService.getProjectTasks(eq(projectId), eq(testUser.getId())))
                .thenReturn(List.of(t1, t2));

        mockMvc.perform(get("/api/tasks/project/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").value("Project Task 1"));
    }

    @Test
    @DisplayName("5 - GET /api/tasks/{taskId} returns task details")
    void t05_getTask_success() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setTitle("Single Task");
        response.setDescription("Description");
        response.setCompleted(false);

        when(taskService.getTaskById(eq(taskId), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId.toString()))
                .andExpect(jsonPath("$.title").value("Single Task"));
    }

    @Test
    @DisplayName("6 - PUT /api/tasks/{taskId} updates task")
    void t06_updateTask_success() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskUpdateRequest request = new TaskUpdateRequest();
        request.setTitle("Updated Task");
        request.setDescription("Updated description");

        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setTitle("Updated Task");
        response.setDescription("Updated description");
        response.setUpdatedAt(Instant.now());

        when(taskService.updateTask(eq(taskId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/tasks/" + taskId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Task"))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    @DisplayName("7 - PATCH /api/tasks/{taskId}/move moves task to new list")
    void t07_moveTask_success() throws Exception {
        UUID taskId = UUID.randomUUID();
        UUID newTaskListId = UUID.randomUUID();
        TaskMoveRequest request = new TaskMoveRequest();
        request.setNewTaskListId(newTaskListId);
        request.setNewPosition(2000.0);

        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setTitle("Moved Task");

        when(taskService.moveTask(eq(taskId), eq(newTaskListId), eq(2000.0), any())).thenReturn(response);

        mockMvc.perform(patch("/api/tasks/" + taskId + "/move").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Moved Task"));
    }

    @Test
    @DisplayName("8 - PATCH /api/tasks/{taskId}/toggle-complete toggles completion")
    void t08_toggleComplete_success() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setTitle("Task");
        response.setCompleted(true);

        when(taskService.toggleComplete(eq(taskId), any())).thenReturn(response);

        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle-complete").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    @DisplayName("9 - DELETE /api/tasks/{taskId} returns 204")
    void t09_deleteTask_success() throws Exception {
        UUID taskId = UUID.randomUUID();

        mockMvc.perform(delete("/api/tasks/" + taskId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(eq(taskId), any());
    }

    @Test
    @DisplayName("10 - POST /api/tasks/task-list/{taskListId} without CSRF -> 403")
    void t10_createTask_noCsrf_forbidden() throws Exception {
        UUID taskListId = UUID.randomUUID();
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("Test");

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11 - POST /api/tasks/task-list/{taskListId} missing title -> 400")
    void t11_createTask_missingTitle() throws Exception {
        UUID taskListId = UUID.randomUUID();
        Map<String, Object> payload = Map.of("description", "no title");

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("12 - GET /api/tasks/{taskId} -> TaskNotFoundException -> 400")
    void t12_getTask_notFound() throws Exception {
        UUID taskId = UUID.randomUUID();
        when(taskService.getTaskById(eq(taskId), eq(testUser.getId())))
                .thenThrow(new TaskNotFoundException("Task not found"));

        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Task not found")));
    }

    @Test
    @DisplayName("13 - POST /api/tasks/task-list/{taskListId} -> TaskException -> 401")
    void t13_createTask_taskException() throws Exception {
        UUID taskListId = UUID.randomUUID();
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("Test");
        when(taskService.createTask(eq(taskListId), any(), any()))
                .thenThrow(new TaskException("Permission denied"));

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Permission denied")));
    }

    @Test
    @DisplayName("14 - PUT /api/tasks/{taskId} -> RuntimeException -> 500")
    void t14_updateTask_runtimeException() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskUpdateRequest request = new TaskUpdateRequest();
        request.setTitle("Test");
        when(taskService.updateTask(eq(taskId), any(), any()))
                .thenThrow(new RuntimeException("Server error"));

        mockMvc.perform(put("/api/tasks/" + taskId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("15 - GET /api/tasks/{badUuid} invalid UUID -> 400")
    void t15_getTask_invalidUuid() throws Exception {
        mockMvc.perform(get("/api/tasks/not-a-uuid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("16 - PUT /api/tasks/{taskId} with invalid JSON -> 400")
    void t16_updateTask_invalidJson() throws Exception {
        UUID taskId = UUID.randomUUID();
        String invalidJson = "{title: unquoted}";

        mockMvc.perform(put("/api/tasks/" + taskId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("17 - DELETE /api/tasks/{taskId} -> TaskNotFoundException -> 400")
    void t17_deleteTask_notFound() throws Exception {
        UUID taskId = UUID.randomUUID();
        doThrow(new TaskNotFoundException("Task not found"))
                .when(taskService).deleteTask(eq(taskId), any());

        mockMvc.perform(delete("/api/tasks/" + taskId).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Task not found")));
    }

    @Test
    @DisplayName("18 - DELETE /api/tasks/{taskId} -> TaskException -> 401")
    void t18_deleteTask_taskException() throws Exception {
        UUID taskId = UUID.randomUUID();
        doThrow(new TaskException("Only admins can delete"))
                .when(taskService).deleteTask(eq(taskId), any());

        mockMvc.perform(delete("/api/tasks/" + taskId).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Only admins can delete")));
    }

    @Test
    @DisplayName("19 - PATCH move task -> TaskException -> 401")
    void t19_moveTask_taskException() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskMoveRequest request = new TaskMoveRequest();
        request.setNewTaskListId(UUID.randomUUID());
        request.setNewPosition(1000.0);

        when(taskService.moveTask(eq(taskId), any(), any(), any()))
                .thenThrow(new TaskException("Cannot move task"));

        mockMvc.perform(patch("/api/tasks/" + taskId + "/move").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Cannot move task")));
    }

    @Test
    @DisplayName("20 - POST with wrong content-type -> 415 or 400")
    void t20_createTask_wrongContentType() throws Exception {
        UUID taskListId = UUID.randomUUID();
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("Test");

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId).with(csrf())
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (!(s == 415 || s == 400)) throw new AssertionError("Expected 415 or 400 but was " + s);
                });
    }

    @Test
    @DisplayName("21 - GET task list tasks with large list")
    void t21_getTaskListTasks_largeList() throws Exception {
        UUID taskListId = UUID.randomUUID();
        int n = 200;
        List<TaskResponse> tasks = IntStream.range(0, n).mapToObj(i -> {
            TaskResponse t = new TaskResponse();
            t.setId(UUID.randomUUID());
            t.setTitle("Task " + i);
            t.setCompleted(i % 2 == 0);
            return t;
        }).collect(Collectors.toList());

        when(taskService.getTaskListTasks(eq(taskListId), eq(testUser.getId())))
                .thenReturn(tasks);

        mockMvc.perform(get("/api/tasks/task-list/" + taskListId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(n)));
    }

    @Test
    @DisplayName("22 - Toggle complete twice")
    void t22_toggleComplete_twice() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setCompleted(true);

        when(taskService.toggleComplete(eq(taskId), any())).thenReturn(response);

        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle-complete").with(csrf()))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle-complete").with(csrf()))
                .andExpect(status().isOk());

        verify(taskService, Mockito.times(2)).toggleComplete(eq(taskId), any());
    }

    @Test
    @DisplayName("23 - Create task when service returns null -> 500")
    void t23_createTask_nullResponse() throws Exception {
        UUID taskListId = UUID.randomUUID();
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("Test");
        when(taskService.createTask(eq(taskListId), any(), any())).thenReturn(null);

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("24 - Update task when service returns null -> 500")
    void t24_updateTask_nullResponse() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskUpdateRequest request = new TaskUpdateRequest();
        request.setTitle("Test");
        when(taskService.updateTask(eq(taskId), any(), any())).thenReturn(null);

        mockMvc.perform(put("/api/tasks/" + taskId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("25 - Move task when service returns null -> 500")
    void t25_moveTask_nullResponse() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskMoveRequest request = new TaskMoveRequest();
        request.setNewTaskListId(UUID.randomUUID());
        request.setNewPosition(1000.0);
        when(taskService.moveTask(eq(taskId), any(), any(), any())).thenReturn(null);

        mockMvc.perform(patch("/api/tasks/" + taskId + "/move").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("26 - Verify all modifying endpoints require CSRF")
    void t26_allModifyEndpoints_requireCsrf() throws Exception {
        UUID taskListId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId)).andExpect(status().isForbidden());
        mockMvc.perform(put("/api/tasks/" + taskId)).andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/tasks/" + taskId + "/move")).andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle-complete")).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/tasks/" + taskId)).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("27 - Update task with partial data (title only)")
    void t27_updateTask_partialData() throws Exception {
        UUID taskId = UUID.randomUUID();
        Map<String, Object> payload = Map.of("title", "Only Title");

        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setTitle("Only Title");

        when(taskService.updateTask(eq(taskId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/tasks/" + taskId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Only Title"));
    }
/*
    @Test
    @DisplayName("28 - Create task with very long title")
    void t28_createTask_longTitle() throws Exception {
        UUID taskListId = UUID.randomUUID();
        String longTitle = IntStream.range(0, 1000).mapToObj(i -> "x").collect(Collectors.joining());
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle(longTitle);

        mockMvc.perform(post("/api/tasks/task-list/" + taskListId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s == 500) throw new AssertionError("Server error for long title (unexpected)");
                });
    }
*/
    @Test
    @DisplayName("29 - GET task verifies service called")
    void t29_getTask_verification() throws Exception {
        UUID taskId = UUID.randomUUID();
        TaskResponse response = new TaskResponse();
        response.setId(taskId);
        response.setTitle("Test");

        when(taskService.getTaskById(eq(taskId), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk());

        verify(taskService).getTaskById(eq(taskId), eq(testUser.getId()));
    }

    @Test
    @DisplayName("30 - Delete task verifies service called")
    void t30_deleteTask_verification() throws Exception {
        UUID taskId = UUID.randomUUID();

        mockMvc.perform(delete("/api/tasks/" + taskId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(eq(taskId), any());
    }
}