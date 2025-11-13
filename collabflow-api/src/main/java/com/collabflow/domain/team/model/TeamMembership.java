package com.collabflow.domain.team.model;

import com.collabflow.domain.team.model.enums.TeamRole;
import com.collabflow.domain.user.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "team_memberships")
public class TeamMembership {
    @EmbeddedId
    private TeamMembershipId id = new TeamMembershipId();

    @MapsId("teamId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "role", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private TeamRole role;

    @ColumnDefault("now()")
    @Column(name = "joined_at")
    private Instant joinedAt;

}