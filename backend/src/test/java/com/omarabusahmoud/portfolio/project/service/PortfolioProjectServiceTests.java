package com.omarabusahmoud.portfolio.project.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.project.dto.UpsertProjectRequest;
import com.omarabusahmoud.portfolio.project.entity.PortfolioProjectEntity;
import com.omarabusahmoud.portfolio.project.model.ProjectTone;
import com.omarabusahmoud.portfolio.project.repository.PortfolioProjectRepository;
import org.junit.jupiter.api.Test;

class PortfolioProjectServiceTests {
    private final Instant now = Instant.parse("2026-08-10T10:00:00Z");

    @Test
    void returnsOnlyPublishedProjectsForThePublicPortfolio() {
        PortfolioProjectRepository repository = mock(PortfolioProjectRepository.class);
        PortfolioProjectEntity project = project(UUID.randomUUID(), 0, true);
        when(repository.findAllByPublishedTrueOrderByDisplayOrderAsc()).thenReturn(List.of(project));
        PortfolioProjectService service = service(repository);

        assertThat(service.publicProjects()).singleElement().satisfies(response -> {
            assertThat(response.title()).isEqualTo("Example Project");
            assertThat(response.published()).isTrue();
            assertThat(response.technologies()).containsExactly("Next.js", "TypeScript");
            assertThat(response.caseStudy().problem()).isEqualTo("The original problem.");
            assertThat(response.caseStudy().solution()).isEqualTo("The implemented solution.");
            assertThat(response.caseStudy().result()).isEqualTo("The measured result.");
        });
    }

    @Test
    void reordersEveryProjectAsOneValidatedSet() {
        PortfolioProjectRepository repository = mock(PortfolioProjectRepository.class);
        PortfolioProjectEntity first = project(UUID.randomUUID(), 0, true);
        PortfolioProjectEntity second = project(UUID.randomUUID(), 1, false);
        when(repository.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(first, second));
        when(repository.findById(first.getId())).thenReturn(Optional.of(first));
        when(repository.findById(second.getId())).thenReturn(Optional.of(second));
        PortfolioProjectService service = service(repository);

        service.reorder(List.of(second.getId(), first.getId()));

        assertThat(second.getDisplayOrder()).isZero();
        assertThat(first.getDisplayOrder()).isEqualTo(1);
        verify(repository).flush();
    }

    private PortfolioProjectService service(PortfolioProjectRepository repository) {
        return new PortfolioProjectService(repository, Clock.fixed(now, ZoneOffset.UTC));
    }

    private PortfolioProjectEntity project(UUID id, int order, boolean published) {
        return new PortfolioProjectEntity(id, new UpsertProjectRequest(
                "Example Project", "Example", "Project", "Web application",
                "A concise project description.", "/projects/example.png", null, "Example project interface",
                1200, 800, "center top", "https://example.com", null, ProjectTone.LIME,
                List.of("Next.js", "TypeScript"), "The original problem.", "The implemented solution.",
                "The measured result.", "Example Customer", "/projects/example.png",
                "Example customer", BigDecimal.valueOf(5), "A thoughtful customer review.", published), order, now);
    }
}
