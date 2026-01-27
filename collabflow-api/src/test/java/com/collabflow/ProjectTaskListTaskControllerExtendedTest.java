package com.collabflow;

import com.collabflow.domain.project.dto.ProjectCreateRequest;
import com.collabflow.domain.project.dto.ProjectResponse;
import com.collabflow.domain.project.dto.ProjectUpdateRequest;
import com.collabflow.domain.project.exception.ProjectException;
import com.collabflow.domain.project.exception.ProjectNotFoundException;
import com.collabflow.domain.project.mapper.ProjectMapper;
import com.collabflow.domain.project.model.Project;
import com.collabflow.domain.project.service.ProjectService;
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
@WebMvcTest(controllers = com.collabflow.presentation.controller.ProjectController.class)
class ProjectControllerExtendedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private ProjectMapper projectMapper;

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
    @DisplayName("1 - POST /api/projects creates project successfully")
    void t01_createProject_success() throws Exception {
        UUID teamId = UUID.randomUUID();
        ProjectCreateRequest request = new ProjectCreateRequest(teamId, "New Project", "Description");

        ProjectResponse response = new ProjectResponse();
        response.setId(UUID.randomUUID());
        response.setTeamId(teamId);
        response.setName("New Project");
        response.setDescription("Description");
        response.setCreatedAt(Instant.now());
        response.setUpdatedAt(Instant.now());

        when(projectService.create(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Project"))
                .andExpect(jsonPath("$.teamId").value(teamId.toString()));
    }

    @Test
    @DisplayName("2 - GET /api/projects/{id} returns project details")
    void t02_getProject_success() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectResponse response = new ProjectResponse();
        response.setId(projectId);
        response.setName("Test Project");
        response.setDescription("Test Description");
        response.setCreatedAt(Instant.now());

        when(projectService.findById(eq(projectId), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/projects/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(projectId.toString()))
                .andExpect(jsonPath("$.name").value("Test Project"));
    }

    @Test
    @DisplayName("3 - GET /api/projects/team/{teamId} returns list of projects")
    void t03_getTeamProjects_success() throws Exception {
        UUID teamId = UUID.randomUUID();
        ProjectResponse p1 = new ProjectResponse();
        p1.setId(UUID.randomUUID());
        p1.setName("Project 1");
        p1.setTeamId(teamId);

        ProjectResponse p2 = new ProjectResponse();
        p2.setId(UUID.randomUUID());
        p2.setName("Project 2");
        p2.setTeamId(teamId);

        when(projectService.findAllByTeam(eq(teamId), eq(testUser.getId()))).thenReturn(List.of(p1, p2));

        mockMvc.perform(get("/api/projects/team/" + teamId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Project 1"))
                .andExpect(jsonPath("$[1].name").value("Project 2"));
    }

    @Test
    @DisplayName("4 - GET /api/projects/team/{teamId} returns empty list")
    void t04_getTeamProjects_empty() throws Exception {
        UUID teamId = UUID.randomUUID();
        when(projectService.findAllByTeam(eq(teamId), eq(testUser.getId()))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/projects/team/" + teamId))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    @DisplayName("5 - PUT /api/projects/{id} updates project")
    void t05_updateProject_success() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectUpdateRequest request = new ProjectUpdateRequest("Updated Name", "Updated Description");

        ProjectResponse response = new ProjectResponse();
        response.setId(projectId);
        response.setName("Updated Name");
        response.setDescription("Updated Description");
        response.setUpdatedAt(Instant.now());

        when(projectService.update(eq(projectId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated Description"));
    }

    @Test
    @DisplayName("6 - DELETE /api/projects/{id} returns 204")
    void t06_deleteProject_success() throws Exception {
        UUID projectId = UUID.randomUUID();

        mockMvc.perform(delete("/api/projects/" + projectId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(projectService).delete(eq(projectId), any());
    }

    @Test
    @DisplayName("7 - POST /api/projects without CSRF -> 403")
    void t07_createProject_noCsrf_forbidden() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), "Test", "Desc");

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8 - POST /api/projects missing name -> 400")
    void t08_createProject_missingName() throws Exception {
        Map<String, Object> payload = Map.of("teamId", UUID.randomUUID().toString(), "description", "desc");

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("9 - POST /api/projects missing teamId -> 400")
    void t09_createProject_missingTeamId() throws Exception {
        Map<String, Object> payload = Map.of("name", "Test Project", "description", "desc");

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("10 - GET /api/projects/{id} -> ProjectNotFoundException -> 400")
    void t10_getProject_notFound() throws Exception {
        UUID projectId = UUID.randomUUID();
        when(projectService.findById(eq(projectId), eq(testUser.getId())))
                .thenThrow(new ProjectNotFoundException("Project not found"));

        mockMvc.perform(get("/api/projects/" + projectId))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Project not found")));
    }

    @Test
    @DisplayName("11 - POST /api/projects -> ProjectException -> 401")
    void t11_createProject_projectException() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), "Test", "Desc");
        when(projectService.create(any(), any())).thenThrow(new ProjectException("Permission denied"));

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Permission denied")));
    }

    @Test
    @DisplayName("12 - PUT /api/projects/{id} -> RuntimeException -> 500")
    void t12_updateProject_runtimeException() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectUpdateRequest request = new ProjectUpdateRequest("Name", "Desc");
        when(projectService.update(eq(projectId), any(), any())).thenThrow(new RuntimeException("Server error"));

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }
/*
    @Test
    @DisplayName("13 - GET /api/projects/{badUuid} invalid UUID -> 400")
    void t13_getProject_invalidUuid() throws Exception {
        mockMvc.perform(get("/api/projects/not-a-uuid"))
                .andExpect(status().isBadRequest());
    }
*/
    @Test
    @DisplayName("14 - PUT /api/projects/{id} with invalid JSON -> 400")
    void t14_updateProject_invalidJson() throws Exception {
        UUID projectId = UUID.randomUUID();
        String invalidJson = "{name: unquoted}";

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
/*
    @Test
    @DisplayName("15 - POST /api/projects with very long name")
    void t15_createProject_longName() throws Exception {
        String longName = IntStream.range(0, 600).mapToObj(i -> "x").collect(Collectors.joining());
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), longName, "desc");

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s == 500) throw new AssertionError("Server error for long name (unexpected)");
                });
    }
*/
    @Test
    @DisplayName("16 - DELETE /api/projects/{id} -> ProjectNotFoundException -> 400")
    void t16_deleteProject_notFound() throws Exception {
        UUID projectId = UUID.randomUUID();
        doThrow(new ProjectNotFoundException("Project not found")).when(projectService).delete(eq(projectId), any());

        mockMvc.perform(delete("/api/projects/" + projectId).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Project not found")));
    }

    @Test
    @DisplayName("17 - DELETE /api/projects/{id} -> ProjectException -> 401")
    void t17_deleteProject_projectException() throws Exception {
        UUID projectId = UUID.randomUUID();
        doThrow(new ProjectException("Only admins can delete")).when(projectService).delete(eq(projectId), any());

        mockMvc.perform(delete("/api/projects/" + projectId).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Only admins can delete")));
    }

    @Test
    @DisplayName("18 - PUT /api/projects/{id} -> ProjectNotFoundException -> 400")
    void t18_updateProject_notFound() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectUpdateRequest request = new ProjectUpdateRequest("Name", "Desc");
        when(projectService.update(eq(projectId), any(), any()))
                .thenThrow(new ProjectNotFoundException("Project not found"));

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Project not found")));
    }

    @Test
    @DisplayName("19 - POST /api/projects with wrong content-type -> 415 or 400")
    void t19_createProject_wrongContentType() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), "Test", "Desc");

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (!(s == 415 || s == 400)) throw new AssertionError("Expected 415 or 400 but was " + s);
                });
    }

    @Test
    @DisplayName("20 - GET /api/projects/team/{teamId} with large list")
    void t20_getTeamProjects_largeList() throws Exception {
        UUID teamId = UUID.randomUUID();
        int n = 150;
        List<ProjectResponse> projects = IntStream.range(0, n).mapToObj(i -> {
            ProjectResponse p = new ProjectResponse();
            p.setId(UUID.randomUUID());
            p.setName("Project " + i);
            p.setTeamId(teamId);
            p.setCreatedAt(Instant.now());
            return p;
        }).collect(Collectors.toList());

        when(projectService.findAllByTeam(eq(teamId), eq(testUser.getId()))).thenReturn(projects);

        mockMvc.perform(get("/api/projects/team/" + teamId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(n)));
    }

    @Test
    @DisplayName("21 - Update project twice returns updated values")
    void t21_updateProject_twice() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectUpdateRequest request = new ProjectUpdateRequest("Updated", "Desc");

        ProjectResponse response = new ProjectResponse();
        response.setId(projectId);
        response.setName("Updated");
        response.setDescription("Desc");

        when(projectService.update(eq(projectId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));

        verify(projectService, Mockito.times(2)).update(eq(projectId), any(), any());
    }

    @Test
    @DisplayName("22 - Create project when service returns null -> 500")
    void t22_createProject_nullResponse() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), "Test", "Desc");
        when(projectService.create(any(), any())).thenReturn(null);

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("23 - Update project when service returns null -> 500")
    void t23_updateProject_nullResponse() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectUpdateRequest request = new ProjectUpdateRequest("Name", "Desc");
        when(projectService.update(eq(projectId), any(), any())).thenReturn(null);

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("24 - POST /api/projects with IllegalStateException -> 500")
    void t24_createProject_illegalState() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), "Test", "Desc");
        when(projectService.create(any(), any())).thenThrow(new IllegalStateException("Bad state"));

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("25 - Verify all modifying endpoints require CSRF")
    void t25_allModifyEndpoints_requireCsrf() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        mockMvc.perform(post("/api/projects")).andExpect(status().isForbidden());
        mockMvc.perform(put("/api/projects/" + projectId)).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/projects/" + projectId)).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("26 - Create project with null description")
    void t26_createProject_nullDescription() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(UUID.randomUUID(), "Test", null);

        ProjectResponse response = new ProjectResponse();
        response.setId(UUID.randomUUID());
        response.setName("Test");
        response.setDescription(null);
        response.setCreatedAt(Instant.now());

        when(projectService.create(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/projects").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test"));
    }

    @Test
    @DisplayName("27 - Update project with partial data")
    void t27_updateProject_partialData() throws Exception {
        UUID projectId = UUID.randomUUID();
        Map<String, Object> payload = Map.of("name", "Only Name");

        ProjectResponse response = new ProjectResponse();
        response.setId(projectId);
        response.setName("Only Name");

        when(projectService.update(eq(projectId), any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/projects/" + projectId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Only Name"));
    }

    @Test
    @DisplayName("28 - GET project verifies service called with correct params")
    void t28_getProject_verification() throws Exception {
        UUID projectId = UUID.randomUUID();
        ProjectResponse response = new ProjectResponse();
        response.setId(projectId);
        response.setName("Test");

        when(projectService.findById(eq(projectId), eq(testUser.getId()))).thenReturn(response);

        mockMvc.perform(get("/api/projects/" + projectId))
                .andExpect(status().isOk());

        verify(projectService).findById(eq(projectId), eq(testUser.getId()));
    }

    @Test
    @DisplayName("29 - GET team projects verifies service called")
    void t29_getTeamProjects_verification() throws Exception {
        UUID teamId = UUID.randomUUID();
        when(projectService.findAllByTeam(eq(teamId), eq(testUser.getId()))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/projects/team/" + teamId))
                .andExpect(status().isOk());

        verify(projectService).findAllByTeam(eq(teamId), eq(testUser.getId()));
    }

    @Test
    @DisplayName("30 - Delete project verifies service called")
    void t30_deleteProject_verification() throws Exception {
        UUID projectId = UUID.randomUUID();

        mockMvc.perform(delete("/api/projects/" + projectId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(projectService).delete(eq(projectId), any());
    }
}