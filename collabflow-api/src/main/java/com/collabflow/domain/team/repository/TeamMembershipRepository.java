package com.collabflow.domain.team.repository;

import com.collabflow.domain.team.model.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeamMembershipRepository extends JpaRepository<TeamMembership, UUID> {
}
