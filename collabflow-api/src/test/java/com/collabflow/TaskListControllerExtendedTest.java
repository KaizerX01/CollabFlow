package com.collabflow;

import com.collabflow.domain.tasklist.dto.TaskListCreateRequest;
import com.collabflow.domain.tasklist.dto.TaskListResponse;
import com.collabflow.domain.tasklist.dto.TaskListUpdateRequest;
import com.collabflow.domain.tasklist.exception.TaskListException;
import com.collabflow.domain.tasklist.exception.TaskListNotFoundException;
import com.collabflow.domain.tasklist.mapper.TaskListMapper;
import com.collabflow.domain.tasklist.model.TaskList;
import com.collabflow.domain.tasklist.service.TaskListService;
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
@WebMvcTest(controllers = com.collabflow.presentation.controller.TaskListController.class)
class TaskListControllerExtendedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskListService taskListService;

    @MockBean
    private TaskListMapper taskListMapper;

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
    @DisplayName("1 - POST /api/task-lists/project/{projectId} creates task list")
    void t01_createTaskList_success() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "To Do", 1000.0);

        TaskListResponse response = new TaskListResponse();
        response.setId(UUID.randomUUID());
        response.setProjectId(projectId);
        response.setName("To Do");
        response.setPosition(1000.0);
        response.setCreatedAt(Instant.now());

        when(taskListService.createTaskList(eq(projectId), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("To Do"))
                .andExpect(jsonPath("$.projectId").value(projectId.toString()));
    }

    @Test
    @DisplayName("2 - GET /api/task-lists/project/{projectId} returns task lists")
    void t02_getProjectTaskLists_success() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListResponse tl1 = new TaskListResponse();
        tl1.setId(UUID.randomUUID());
        tl1.setName("To Do");
        tl1.setPosition(1000.0);

        TaskListResponse tl2 = new TaskListResponse();
        tl2.setId(UUID.randomUUID());
        tl2.setName("In Progress");
        tl2.setPosition(2000.0);

        when(taskListService.getProjectTaskLists(eq(projectId), eq(testUser.getId())))
                .thenReturn(List.of(tl1, tl2));

        mockMvc.perform(get("/api/task-lists/project/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("To Do"))
                .andExpect(jsonPath("$[1].name").value("In Progress"));
    }

    @Test
    @DisplayName("3 - GET /api/task-lists/project/{projectId} returns empty list")
    void t03_getProjectTaskLists_empty() throws Exception {
        UUID projectId = UUID.randomUUID();
        when(taskListService.getProjectTaskLists(eq(projectId), eq(testUser.getId())))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/task-lists/project/" + projectId))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    @DisplayName("4 - GET /api/task-lists/{listId} returns task list details")
    void t04_getTaskList_success() throws Exception {
        UUID listId = UUID.randomUUID();
        TaskListResponse response = new TaskListResponse();
        response.setId(listId);
        response.setName("Done");
        response.setPosition(3000.0);

        when(taskListService.getTaskListById(eq(listId), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/task-lists/" + listId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(listId.toString()))
                .andExpect(jsonPath("$.name").value("Done"));
    }

    @Test
    @DisplayName("5 - PUT /api/task-lists/{listId} updates task list")
    void t05_updateTaskList_success() throws Exception {
        UUID listId = UUID.randomUUID();
        TaskListUpdateRequest request = new TaskListUpdateRequest("Updated List", 1500.0);

        TaskListResponse response = new TaskListResponse();
        response.setId(listId);
        response.setName("Updated List");
        response.setPosition(1500.0);
        response.setUpdatedAt(Instant.now());

        when(taskListService.updateTaskList(eq(listId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/task-lists/" + listId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated List"))
                .andExpect(jsonPath("$.position").value(1500.0));
    }

    @Test
    @DisplayName("6 - DELETE /api/task-lists/{listId} returns 204")
    void t06_deleteTaskList_success() throws Exception {
        UUID listId = UUID.randomUUID();

        mockMvc.perform(delete("/api/task-lists/" + listId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(taskListService).deleteTaskList(eq(listId), any());
    }

    @Test
    @DisplayName("7 - PATCH /api/task-lists/project/{projectId}/reorder reorders lists")
    void t07_reorderTaskLists_success() throws Exception {
        UUID projectId = UUID.randomUUID();
        List<UUID> orderedIds = List.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

        mockMvc.perform(patch("/api/task-lists/project/" + projectId + "/reorder").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderedIds)))
                .andExpect(status().isOk());

        verify(taskListService).reorderTaskLists(eq(projectId), eq(orderedIds), any());
    }

    @Test
    @DisplayName("8 - POST /api/task-lists/project/{projectId} without CSRF -> 403")
    void t08_createTaskList_noCsrf_forbidden() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "Test", 1000.0);

        mockMvc.perform(post("/api/task-lists/project/" + projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9 - POST /api/task-lists/project/{projectId} missing name -> 400")
    void t09_createTaskList_missingName() throws Exception {
        UUID projectId = UUID.randomUUID();
        Map<String, Object> payload = Map.of("position", 1000.0);

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("10 - GET /api/task-lists/{listId} -> TaskListNotFoundException -> 400")
    void t10_getTaskList_notFound() throws Exception {
        UUID listId = UUID.randomUUID();
        when(taskListService.getTaskListById(eq(listId), eq(testUser.getId())))
                .thenThrow(new TaskListNotFoundException("Task list not found"));

        mockMvc.perform(get("/api/task-lists/" + listId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Task list not found")));
    }

    @Test
    @DisplayName("11 - POST /api/task-lists/project/{projectId} -> TaskListException -> 401")
    void t11_createTaskList_taskListException() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "Test", 1000.0);
        when(taskListService.createTaskList(eq(projectId), any(), any()))
                .thenThrow(new TaskListException("Only admins can create"));

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Only admins can create")));
    }

    @Test
    @DisplayName("12 - PUT /api/task-lists/{listId} -> RuntimeException -> 500")
    void t12_updateTaskList_runtimeException() throws Exception {
        UUID listId = UUID.randomUUID();
        TaskListUpdateRequest request = new TaskListUpdateRequest("Name", 1000.0);
        when(taskListService.updateTaskList(eq(listId), any(), any()))
                .thenThrow(new RuntimeException("Server error"));

        mockMvc.perform(put("/api/task-lists/" + listId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }
/*
    @Test
    @DisplayName("13 - GET /api/task-lists/{badUuid} invalid UUID -> 400")
    void t13_getTaskList_invalidUuid() throws Exception {
        mockMvc.perform(get("/api/task-lists/not-a-uuid"))
                .andExpect(status().isBadRequest());
    }
*/
    @Test
    @DisplayName("14 - PUT /api/task-lists/{listId} with invalid JSON -> 400")
    void t14_updateTaskList_invalidJson() throws Exception {
        UUID listId = UUID.randomUUID();
        String invalidJson = "{name: unquoted}";

        mockMvc.perform(put("/api/task-lists/" + listId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("15 - DELETE /api/task-lists/{listId} -> TaskListNotFoundException -> 400")
    void t15_deleteTaskList_notFound() throws Exception {
        UUID listId = UUID.randomUUID();
        doThrow(new TaskListNotFoundException("Task list not found"))
                .when(taskListService).deleteTaskList(eq(listId), any());

        mockMvc.perform(delete("/api/task-lists/" + listId).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Task list not found")));
    }

    @Test
    @DisplayName("16 - DELETE /api/task-lists/{listId} -> TaskListException -> 401")
    void t16_deleteTaskList_taskListException() throws Exception {
        UUID listId = UUID.randomUUID();
        doThrow(new TaskListException("Only admins can delete"))
                .when(taskListService).deleteTaskList(eq(listId), any());

        mockMvc.perform(delete("/api/task-lists/" + listId).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Only admins can delete")));
    }

    @Test
    @DisplayName("17 - PATCH reorder -> TaskListException -> 401")
    void t17_reorderTaskLists_taskListException() throws Exception {
        UUID projectId = UUID.randomUUID();
        List<UUID> orderedIds = List.of(UUID.randomUUID());
        doThrow(new TaskListException("Only admins can reorder"))
                .when(taskListService).reorderTaskLists(eq(projectId), any(), any());

        mockMvc.perform(patch("/api/task-lists/project/" + projectId + "/reorder").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderedIds)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Only admins can reorder")));
    }

    @Test
    @DisplayName("18 - POST with wrong content-type -> 415 or 400")
    void t18_createTaskList_wrongContentType() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "Test", 1000.0);

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (!(s == 415 || s == 400)) throw new AssertionError("Expected 415 or 400 but was " + s);
                });
    }

    @Test
    @DisplayName("19 - GET project task lists with large list")
    void t19_getProjectTaskLists_largeList() throws Exception {
        UUID projectId = UUID.randomUUID();
        int n = 100;
        List<TaskListResponse> taskLists = IntStream.range(0, n).mapToObj(i -> {
            TaskListResponse tl = new TaskListResponse();
            tl.setId(UUID.randomUUID());
            tl.setName("List " + i);
            tl.setPosition(i * 1000.0);
            tl.setProjectId(projectId);
            return tl;
        }).collect(Collectors.toList());

        when(taskListService.getProjectTaskLists(eq(projectId), eq(testUser.getId())))
                .thenReturn(taskLists);

        mockMvc.perform(get("/api/task-lists/project/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(n)));
    }

    @Test
    @DisplayName("20 - Create task list without position auto-calculates")
    void t20_createTaskList_nullPosition() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "New List", null);

        TaskListResponse response = new TaskListResponse();
        response.setId(UUID.randomUUID());
        response.setName("New List");
        response.setPosition(1000.0);

        when(taskListService.createTaskList(eq(projectId), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(1000.0));
    }

    @Test
    @DisplayName("21 - Update task list with partial data (name only)")
    void t21_updateTaskList_partialData() throws Exception {
        UUID listId = UUID.randomUUID();
        Map<String, Object> payload = Map.of("name", "Updated Name");

        TaskListResponse response = new TaskListResponse();
        response.setId(listId);
        response.setName("Updated Name");

        when(taskListService.updateTaskList(eq(listId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/task-lists/" + listId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @DisplayName("22 - Reorder with empty list")
    void t22_reorderTaskLists_emptyList() throws Exception {
        UUID projectId = UUID.randomUUID();
        List<UUID> emptyList = Collections.emptyList();

        mockMvc.perform(patch("/api/task-lists/project/" + projectId + "/reorder").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyList)))
                .andExpect(status().isOk());

        verify(taskListService).reorderTaskLists(eq(projectId), eq(emptyList), any());
    }

    @Test
    @DisplayName("23 - Create task list when service returns null -> 500")
    void t23_createTaskList_nullResponse() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "Test", 1000.0);
        when(taskListService.createTaskList(eq(projectId), any(), any())).thenReturn(null);

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("24 - Update task list when service returns null -> 500")
    void t24_updateTaskList_nullResponse() throws Exception {
        UUID listId = UUID.randomUUID();
        TaskListUpdateRequest request = new TaskListUpdateRequest("Name", 1000.0);
        when(taskListService.updateTaskList(eq(listId), any(), any())).thenReturn(null);

        mockMvc.perform(put("/api/task-lists/" + listId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("25 - Verify all modifying endpoints require CSRF")
    void t25_allModifyEndpoints_requireCsrf() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID listId = UUID.randomUUID();

        mockMvc.perform(post("/api/task-lists/project/" + projectId)).andExpect(status().isForbidden());
        mockMvc.perform(put("/api/task-lists/" + listId)).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/task-lists/" + listId)).andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/task-lists/project/" + projectId + "/reorder")).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("26 - Create task list twice verifies service called twice")
    void t26_createTaskList_twice() throws Exception {
        UUID projectId = UUID.randomUUID();
        TaskListCreateRequest request = new TaskListCreateRequest(projectId, "Test", 1000.0);

        TaskListResponse response = new TaskListResponse();
        response.setId(UUID.randomUUID());
        response.setName("Test");

        when(taskListService.createTaskList(eq(projectId), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/task-lists/project/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(taskListService, Mockito.times(2)).createTaskList(eq(projectId), any(), any());
    }

    @Test
    @DisplayName("27 - GET task list verifies service called")
    void t27_getTaskList_verification() throws Exception {
        UUID listId = UUID.randomUUID();
        TaskListResponse response = new TaskListResponse();
        response.setId(listId);
        response.setName("Test");

        when(taskListService.getTaskListById(eq(listId), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/task-lists/" + listId))
                .andExpect(status().isOk());

        verify(taskListService).getTaskListById(eq(listId), eq(testUser.getId()));
    }

    @Test
    @DisplayName("28 - GET project task lists verifies service called")
    void t28_getProjectTaskLists_verification() throws Exception {
        UUID projectId = UUID.randomUUID();
        when(taskListService.getProjectTaskLists(eq(projectId), eq(testUser.getId())))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/task-lists/project/" + projectId))
                .andExpect(status().isOk());

        verify(taskListService).getProjectTaskLists(eq(projectId), eq(testUser.getId()));
    }

    @Test
    @DisplayName("29 - Update task list verifies service called")
    void t29_updateTaskList_verification() throws Exception {
        UUID listId = UUID.randomUUID();
        TaskListUpdateRequest request = new TaskListUpdateRequest("Name", 1000.0);

        TaskListResponse response = new TaskListResponse();
        response.setId(listId);
        response.setName("Name");

        when(taskListService.updateTaskList(eq(listId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/task-lists/" + listId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(taskListService).updateTaskList(eq(listId), any(), any());
    }

    @Test
    @DisplayName("30 - Delete task list verifies service called")
    void t30_deleteTaskList_verification() throws Exception {
        UUID listId = UUID.randomUUID();

        mockMvc.perform(delete("/api/task-lists/" + listId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(taskListService).deleteTaskList(eq(listId), any());
    }
}