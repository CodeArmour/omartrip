package com.omarabusahmoud.portfolio.skill.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.skill.dto.UpsertSkillRequest;
import com.omarabusahmoud.portfolio.skill.entity.PortfolioSkillEntity;
import com.omarabusahmoud.portfolio.skill.repository.PortfolioSkillRepository;
import org.junit.jupiter.api.Test;

class PortfolioSkillServiceTests {
    private final Instant now = Instant.parse("2026-08-10T10:00:00Z");

    @Test
    void returnsPublishedSkillsForThePublicSphere() {
        PortfolioSkillRepository repository = mock(PortfolioSkillRepository.class);
        PortfolioSkillEntity skill = skill(UUID.randomUUID(), "Spring", 0, true);
        when(repository.findAllByPublishedTrueOrderByDisplayOrderAsc()).thenReturn(List.of(skill));

        assertThat(service(repository).publicSkills()).singleElement().satisfies(response -> {
            assertThat(response.name()).isEqualTo("Spring");
            assertThat(response.category()).isEqualTo("Backend");
            assertThat(response.published()).isTrue();
        });
    }

    @Test
    void reordersTheCompleteSkillSet() {
        PortfolioSkillRepository repository = mock(PortfolioSkillRepository.class);
        PortfolioSkillEntity first = skill(UUID.randomUUID(), "Java", 0, true);
        PortfolioSkillEntity second = skill(UUID.randomUUID(), "React", 1, false);
        when(repository.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(first, second));
        when(repository.findById(first.getId())).thenReturn(Optional.of(first));
        when(repository.findById(second.getId())).thenReturn(Optional.of(second));

        service(repository).reorder(List.of(second.getId(), first.getId()));

        assertThat(second.getDisplayOrder()).isZero();
        assertThat(first.getDisplayOrder()).isEqualTo(1);
        verify(repository).flush();
    }

    private PortfolioSkillService service(PortfolioSkillRepository repository) {
        return new PortfolioSkillService(repository, Clock.fixed(now, ZoneOffset.UTC));
    }

    private PortfolioSkillEntity skill(UUID id, String name, int order, boolean published) {
        return new PortfolioSkillEntity(id,
                new UpsertSkillRequest(name, "Backend", "/skills/" + name + ".svg", null, published),
                order, now);
    }
}
