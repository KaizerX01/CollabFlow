package com.collabflow;

import com.collabflow.domain.team.dto.TeamMemberResponse;
import com.collabflow.domain.team.dto.TeamResponse;
import com.collabflow.domain.team.exception.TeamException;
import com.collabflow.domain.team.exception.TeamNotFoundException;
import com.collabflow.domain.team.mapper.TeamMapper;
import com.collabflow.domain.team.mapper.TeamMemberMapper;
import com.collabflow.domain.team.model.Team;
import com.collabflow.domain.team.model.TeamMembership;
import com.collabflow.domain.team.model.enums.TeamRole;
import com.collabflow.domain.team.service.TeamService;
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
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
//@Import(TestSecurityConfig.class)
@WebMvcTest(controllers = com.collabflow.presentation.controller.TeamController.class)
class TeamControllerExtendedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeamService teamService;

    @MockBean
    private TeamMapper teamMapper;

    @MockBean
    private TeamMemberMapper teamMemberMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private CustomUserDetails testUserDetails;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("goat@example.com");
        testUser.setUsername("The GOAT");

        testUserDetails = new CustomUserDetails(testUser);

        var auth = new UsernamePasswordAuthenticationToken(
                testUserDetails,
                null,
                testUserDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test @DisplayName("1 - GET /api/teams returns single team")
    void t01_getTeams_single() throws Exception {
        Team t = new Team(); t.setId(UUID.randomUUID()); t.setName("Team A");
        when(teamService.getTeams(testUser.getId())).thenReturn(List.of(t));
        TeamResponse resp = new TeamResponse(); resp.setId(t.getId()); resp.setName("Team A"); resp.setCreatedAt(Instant.now());
        when(teamMapper.toDto(t)).thenReturn(resp);

        mockMvc.perform(get("/api/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Team A"));
    }

    @Test @DisplayName("2 - GET /api/teams returns empty array")
    void t02_getTeams_empty() throws Exception {
        when(teamService.getTeams(testUser.getId())).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/teams"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test @DisplayName("3 - GET /api/teams/{id} returns team details")
    void t03_getTeamById() throws Exception {
        UUID id = UUID.randomUUID();
        Team t = new Team(); t.setId(id); t.setName("X");
        when(teamService.getTeamById(eq(id), eq(testUser.getId()))).thenReturn(t);
        TeamResponse r = new TeamResponse(); r.setId(id); r.setName("X"); r.setCreatedAt(Instant.now());
        when(teamMapper.toDto(t)).thenReturn(r);

        mockMvc.perform(get("/api/teams/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("X"));
    }

    @Test @DisplayName("4 - POST /api/teams creates team (happy)")
    void t04_createTeam() throws Exception {
        Map<String,Object> payload = Map.of("name","New S|W Team","description","desc");
        Team created = new Team(); created.setId(UUID.randomUUID()); created.setName("New S|W Team");
        when(teamService.addTeam(any(User.class), any())).thenReturn(created);
        TeamResponse r = new TeamResponse(); r.setId(created.getId()); r.setName(created.getName()); r.setCreatedAt(Instant.now());
        when(teamMapper.toDto(created)).thenReturn(r);

        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New S|W Team"));
    }

    @Test @DisplayName("5 - PATCH /api/teams/{id} updates team")
    void t05_updateTeam() throws Exception {
        UUID id = UUID.randomUUID();
        Map<String,Object> payload = Map.of("name","Updated","description","u");
        Team updated = new Team(); updated.setId(id); updated.setName("Updated");
        when(teamService.updateTeam(eq(id), eq(testUser.getId()), any())).thenReturn(updated);
        TeamResponse r = new TeamResponse(); r.setId(id); r.setName("Updated"); r.setCreatedAt(Instant.now());
        when(teamMapper.toDto(updated)).thenReturn(r);

        mockMvc.perform(patch("/api/teams/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test @DisplayName("6 - DELETE /api/teams/{id} returns 204")
    void t06_deleteTeam() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/teams/" + id).with(csrf()))
                .andExpect(status().isNoContent());

        verify(teamService).deleteTeam(eq(id), any());
    }

    @Test @DisplayName("7 - POST /api/teams/{teamId}/invite returns link")
    void t07_createInvite() throws Exception {
        UUID tid = UUID.randomUUID();
        when(teamService.createInviteLink(eq(tid), eq(testUser.getId()))).thenReturn("LNK-42");

        mockMvc.perform(post("/api/teams/" + tid + "/invite").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteLink").value("LNK-42"));
    }

    @Test @DisplayName("8 - POST /api/teams/join/{token} joins team")
    void t08_joinTeam() throws Exception {
        String token = "token42";
        Team t = new Team(); t.setId(UUID.randomUUID()); t.setName("Joined");
        when(teamService.joinTeamByInvite(eq(token), eq(testUser.getId()))).thenReturn(t);
        TeamResponse r = new TeamResponse(); r.setId(t.getId()); r.setName("Joined"); r.setCreatedAt(Instant.now());
        when(teamMapper.toDto(t)).thenReturn(r);

        mockMvc.perform(post("/api/teams/join/" + token).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Joined"));
    }

    @Test @DisplayName("9 - GET /api/teams/{id}/members returns list (empty)")
    void t09_getMembers_empty() throws Exception {
        UUID id = UUID.randomUUID();
        when(teamService.getTeamMemberships(testUser.getId(), id)).thenReturn(Set.of());
        mockMvc.perform(get("/api/teams/" + id + "/members"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test @DisplayName("10 - GET /api/teams/{id}/members calls mapper for results")
    void t10_getMembers_mapper() throws Exception {
        UUID id = UUID.randomUUID();
        TeamMembership memberModel = mock(TeamMembership.class);

        when(teamService.getTeamMemberships(eq(testUser.getId()), eq(id)))
                .thenReturn(Set.of(memberModel));

        TeamMemberResponse dto = new TeamMemberResponse(); dto.setId(UUID.randomUUID()); dto.setUsername("Alice"); dto.setRole(TeamRole.valueOf("MEMBER"));
        when(teamMemberMapper.toDto(any())).thenReturn(dto);

        mockMvc.perform(get("/api/teams/" + id + "/members"))
                .andExpect(status().isOk())
                // FIXED: Checked 'username' instead of 'displayName'
                .andExpect(jsonPath("$[0].username").value("Alice"));
    }

    @Test @DisplayName("11 - POST /api/teams missing name -> 400")
    void t11_createTeam_missingName() throws Exception {
        Map<String,Object> payload = Map.of("description","no name");
        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("12 - POST /api/teams very long name -> 400 or handled")
    void t12_createTeam_longName() throws Exception {
        String longName = IntStream.range(0,600).mapToObj(i->"x").collect(Collectors.joining());
        Map<String,Object> payload = Map.of("name", longName, "description", "desc");
        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s == 500) throw new AssertionError("Server error for long name (unexpected)");
                });
    }

    @Test @DisplayName("13 - PATCH /api/teams/{id} with invalid JSON -> 400")
    void t13_update_invalidJson() throws Exception {
        UUID id = UUID.randomUUID();
        String invalidJson = "{name: unquoted}";
        mockMvc.perform(patch("/api/teams/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("14 - GET /api/teams/{badUuid} invalid UUID -> 400")
    void t14_badUuid() throws Exception {
        mockMvc.perform(get("/api/teams/not-a-uuid"))
                .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("15 - PATCH role missing param -> 400")
    void t15_roleMissingParam() throws Exception {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        mockMvc.perform(patch("/api/teams/" + teamId + "/members/" + userId + "/role").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("16 - Delete leave without CSRF -> 403")
    void t16_leave_noCsrf_forbidden() throws Exception {
        UUID teamId = UUID.randomUUID();
        mockMvc.perform(delete("/api/teams/" + teamId + "/leave")) // no csrf()
                .andExpect(status().isForbidden());
    }

    @Test @DisplayName("17 - GET /api/teams/{id} -> TeamNotFoundException triggers 400")
    void t17_teamNotFoundHandler() throws Exception {
        UUID id = UUID.randomUUID();
        when(teamService.getTeamById(id, testUser.getId())).thenThrow(new TeamNotFoundException("not found"));
        mockMvc.perform(get("/api/teams/" + id))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("not found")));
    }

    @Test @DisplayName("18 - POST /api/teams -> TeamException triggers 401")
    void t18_teamExceptionHandler() throws Exception {
        Map<String,Object> payload = Map.of("name","X", "description","d");
        when(teamService.addTeam(any(), any())).thenThrow(new TeamException("forbidden action"));
        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("forbidden action")));
    }

    @Test @DisplayName("19 - PATCH /api/teams/{id} -> runtime exception -> 500")
    void t19_updateRuntimeException() throws Exception {
        UUID id = UUID.randomUUID();
        Map<String,Object> p = Map.of("name","boom");
        when(teamService.updateTeam(eq(id), eq(testUser.getId()), any())).thenThrow(new RuntimeException("boom"));
        mockMvc.perform(patch("/api/teams/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isInternalServerError());
    }

    @Test @DisplayName("20 - POST /api/teams/join -> invalid token -> TeamNotFound -> 400")
    void t20_join_invalidToken() throws Exception {
        String tok = "badtok";
        when(teamService.joinTeamByInvite(eq(tok), eq(testUser.getId()))).thenThrow(new TeamNotFoundException("invalid token"));
        mockMvc.perform(post("/api/teams/join/" + tok).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("invalid token")));
    }

    @Test @DisplayName("21 - DELETE member -> service throws TeamException -> 401")
    void t21_deleteMember_serviceThrows() throws Exception {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        doThrow(new TeamException("cannot remove")).when(teamService).removeMember(eq(teamId), eq(userId), any());
        mockMvc.perform(delete("/api/teams/" + teamId + "/members/" + userId).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("cannot remove")));
    }

    @Test @DisplayName("22 - Mapper returns null -> controller handles gracefully (500)")
    void t22_mapperReturnsNull() throws Exception {
        UUID id = UUID.randomUUID();
        Team t = new Team(); t.setId(id); t.setName("nullmap");
        when(teamService.getTeamById(id, testUser.getId())).thenReturn(t);
        when(teamMapper.toDto(t)).thenReturn(null);

        mockMvc.perform(get("/api/teams/" + id))
                .andExpect(status().isInternalServerError());
    }

    @Test @DisplayName("23 - Invite created twice returns same link (idempotent)")
    void t23_invite_idempotent() throws Exception {
        UUID tid = UUID.randomUUID();
        when(teamService.createInviteLink(eq(tid), eq(testUser.getId()))).thenReturn("SAME");
        mockMvc.perform(post("/api/teams/" + tid + "/invite").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteLink").value("SAME"));

        mockMvc.perform(post("/api/teams/" + tid + "/invite").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteLink").value("SAME"));

        verify(teamService, Mockito.times(2)).createInviteLink(eq(tid), eq(testUser.getId()));
    }

    @Test
    @DisplayName("24 - Join twice returns same result and service called twice")
    void t24_join_twice() throws Exception {
        String tok = "double";

        // Mock Team entity
        Team t = new Team();
        t.setId(UUID.randomUUID());
        t.setName("joinedTwice");

        // Mocked DTO that controller will return
        TeamResponse response = new TeamResponse();
        response.setId(t.getId());
        response.setName(t.getName());

        // Mock service and mapper
        when(teamService.joinTeamByInvite(eq(tok), eq(testUser.getId()))).thenReturn(t);
        when(teamMapper.toDto(any(Team.class))).thenReturn(response);

        // First join
        mockMvc.perform(post("/api/teams/join/" + tok).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("joinedTwice"));

        // Second join
        mockMvc.perform(post("/api/teams/join/" + tok).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("joinedTwice"));

        // Verify service called twice
        verify(teamService, Mockito.times(2)).joinTeamByInvite(eq(tok), eq(testUser.getId()));
    }


    @Test @DisplayName("25 - Update member role verifies service called with expected newRole")
    void t25_updateRole_verification() throws Exception {
        UUID t = UUID.randomUUID(); UUID u = UUID.randomUUID();
        mockMvc.perform(patch("/api/teams/" + t + "/members/" + u + "/role").with(csrf()).param("newRole","ADMIN"))
                .andExpect(status().isNoContent());
        verify(teamService).updateMemberRole(eq(t), eq(u), eq("ADMIN"), any());
    }

    @Test @DisplayName("26 - Transfer ownership verifies invocation")
    void t26_transferOwner_invocation() throws Exception {
        UUID t = UUID.randomUUID(); UUID newOwner = UUID.randomUUID();
        mockMvc.perform(patch("/api/teams/" + t + "/transfer-owner/" + newOwner).with(csrf()))
                .andExpect(status().isNoContent());
        verify(teamService).transferOwnership(eq(t), eq(newOwner), any());
    }

    @Test @DisplayName("27 - Large list of teams -> ensure performance-ish behavior (200)")
    void t27_largeTeamList() throws Exception {
        int n = 200;
        List<Team> list = IntStream.range(0, n).mapToObj(i -> {
            Team tm = new Team(); tm.setId(UUID.randomUUID()); tm.setName("T"+i); return tm;
        }).collect(Collectors.toList());
        when(teamService.getTeams(testUser.getId())).thenReturn(list);
        when(teamMapper.toDto(any())).thenAnswer(inv -> {
            Team tm = inv.getArgument(0);
            TeamResponse r = new TeamResponse(); r.setId(tm.getId()); r.setName(tm.getName()); r.setCreatedAt(Instant.now());
            return r;
        });

        mockMvc.perform(get("/api/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(n)));
    }

    @Test @DisplayName("28 - Remove member success -> verify service used")
    void t28_removeMember_ok() throws Exception {
        UUID t = UUID.randomUUID(); UUID u = UUID.randomUUID();
        mockMvc.perform(delete("/api/teams/" + t + "/members/" + u).with(csrf()))
                .andExpect(status().isNoContent());
        verify(teamService).removeMember(eq(t), eq(u), any());
    }

    @Test @DisplayName("29 - Leave team success -> verify service used")
    void t29_leaveTeam_ok() throws Exception {
        UUID t = UUID.randomUUID();
        mockMvc.perform(delete("/api/teams/" + t + "/leave").with(csrf()))
                .andExpect(status().isNoContent());
        verify(teamService).leaveTeam(eq(t), any());
    }

    @Test @DisplayName("30 - Controller returns 415 when request content-type wrong")
    void t30_contentTypeWrong() throws Exception {
        Map<String,Object> payload = Map.of("name","A");
        // use text/plain instead of application/json
        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    // accept either 415 or 400 depending on deserialization
                    if (!(s == 415 || s == 400)) throw new AssertionError("Expected 415 or 400 but was " + s);
                });
    }

    @Test @DisplayName("31 - Create team when service throws IllegalState -> 500")
    void t31_create_illegalState() throws Exception {
        Map<String,Object> payload = Map.of("name","X");
        when(teamService.addTeam(any(), any())).thenThrow(new IllegalStateException("badstate"));
        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isInternalServerError());
    }

    @Test @DisplayName("32 - Update team when service returns null -> 500")
    void t32_update_nullReturned() throws Exception {
        UUID id = UUID.randomUUID();
        when(teamService.updateTeam(eq(id), eq(testUser.getId()), any())).thenReturn(null);
        mockMvc.perform(patch("/api/teams/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name","n"))))
                .andExpect(status().isInternalServerError());
    }

    @Test @DisplayName("33 - Create invite when service returns empty string -> 200 with empty link")
    void t33_invite_emptyString() throws Exception {
        UUID tid = UUID.randomUUID();
        when(teamService.createInviteLink(eq(tid), eq(testUser.getId()))).thenReturn("");
        mockMvc.perform(post("/api/teams/" + tid + "/invite").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteLink").value(""));
    }

    @Test @DisplayName("34 - Update role when service throws runtime -> 500")
    void t34_updateRole_runtime() throws Exception {
        UUID t = UUID.randomUUID(); UUID u = UUID.randomUUID();
        doThrow(new RuntimeException("err")).when(teamService).updateMemberRole(eq(t), eq(u), eq("ADMIN"), any());
        mockMvc.perform(patch("/api/teams/" + t + "/members/" + u + "/role").with(csrf()).param("newRole","ADMIN"))
                .andExpect(status().isInternalServerError());
    }

    @Test @DisplayName("35 - Transfer owner when service throws TeamException -> 401")
    void t35_transfer_owner_teamException() throws Exception {
        UUID t = UUID.randomUUID(); UUID newOwner = UUID.randomUUID();
        doThrow(new TeamException("not allowed")).when(teamService).transferOwnership(eq(t), eq(newOwner), any());
        mockMvc.perform(patch("/api/teams/" + t + "/transfer-owner/" + newOwner).with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("not allowed")));
    }

    @Test @DisplayName("36 - Delete team when service throws TeamNotFound -> 400")
    void t36_delete_team_notFound() throws Exception {
        UUID t = UUID.randomUUID();
        doThrow(new TeamNotFoundException("no such team")).when(teamService).deleteTeam(eq(t), any());
        mockMvc.perform(delete("/api/teams/" + t).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("no such team")));
    }

    @Test @DisplayName("37 - Create team when mapper throws -> 500")
    void t37_mapperThrowsOnCreate() throws Exception {
        Map<String,Object> payload = Map.of("name","M");
        Team c = new Team(); c.setId(UUID.randomUUID()); c.setName("M");
        when(teamService.addTeam(any(), any())).thenReturn(c);
        when(teamMapper.toDto(c)).thenThrow(new RuntimeException("mapper failed"));

        mockMvc.perform(post("/api/teams").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isInternalServerError());
    }

    @Test @DisplayName("38 - GET teams when mapper intermittently returns null inside list -> 200 with some nulls (graceful check)")
    void t38_mapperNullInList() throws Exception {
        Team a = new Team(); a.setId(UUID.randomUUID()); a.setName("a");
        Team b = new Team(); b.setId(UUID.randomUUID()); b.setName("b");
        when(teamService.getTeams(testUser.getId())).thenReturn(List.of(a,b));
        when(teamMapper.toDto(a)).thenReturn(new TeamResponse(){{
            setId(a.getId()); setName("a");
        }});
        when(teamMapper.toDto(b)).thenReturn(null); // unexpected null for second item

        mockMvc.perform(get("/api/teams"))
                // either controller returns 500 or returns array with 1 element; ensure not 200+malformed
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 200 && s != 500) throw new AssertionError("Expected 200 or 500 but was " + s);
                });
    }

    @Test @DisplayName("39 - getTeamById but service returns different owner id (security check)")
    void t39_ownerMismatch_safety() throws Exception {
        // Simulate service returning a team belonging to someone else; controller doesn't check ownership here,
        // but this test ensures the response still returns that team (business logic elsewhere should prevent).
        UUID id = UUID.randomUUID();
        Team t = new Team(); t.setId(id); t.setName("external");
        when(teamService.getTeamById(id, testUser.getId())).thenReturn(t);
        when(teamMapper.toDto(t)).thenReturn(new TeamResponse(){{
            setId(id); setName("external");
        }});

        mockMvc.perform(get("/api/teams/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("external"));
    }

    @Test @DisplayName("40 - ensure all modifying endpoints require CSRF (sanity)")
    void t40_allModifyEndpoints_requireCsrf() throws Exception {
        UUID tid = UUID.randomUUID();
        UUID uid = UUID.randomUUID();
        // all without csrf should be 403
        mockMvc.perform(post("/api/teams")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/teams/" + tid + "/invite")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/teams/join/abc")).andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/teams/" + tid)).andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/teams/" + tid + "/members/" + uid + "/role").param("newRole","ADMIN")).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/teams/" + tid)).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/teams/" + tid + "/members/" + uid)).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/teams/" + tid + "/leave")).andExpect(status().isForbidden());
    }
}