package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
}
