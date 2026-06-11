package com.brainfreezed.profitlense;

import com.brainfreezed.profitlense.model.TeamMember;
import com.brainfreezed.profitlense.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TeamSeeder implements CommandLineRunner {

    private final TeamMemberRepository teamMemberRepository;

    @Override
    public void run(String... args) {
        if (teamMemberRepository.count() > 0) {
            log.info("Team members already seeded, skipping.");
            return;
        }

        log.info("Seeding team members...");

        teamMemberRepository.save(TeamMember.builder()
                .name("MD AMIR HAMZA")
                .role("Lead")
                .build());

        teamMemberRepository.save(TeamMember.builder()
                .name("ABU UBAIDA")
                .role("Member")
                .build());

        teamMemberRepository.save(TeamMember.builder()
                .name("MD MIZANUR RAHMAN")
                .role("Member")
                .build());

        teamMemberRepository.save(TeamMember.builder()
                .name("MD ASHIKULLAH")
                .role("Member")
                .build());

        log.info("✅ Seeded {} team members.", teamMemberRepository.count());
    }
}
