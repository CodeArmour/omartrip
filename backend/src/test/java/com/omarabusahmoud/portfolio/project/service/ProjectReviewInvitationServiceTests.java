package com.omarabusahmoud.portfolio.project.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
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

import com.omarabusahmoud.portfolio.project.dto.SubmitProjectReviewRequest;
import com.omarabusahmoud.portfolio.project.dto.UpsertProjectRequest;
import com.omarabusahmoud.portfolio.project.entity.PortfolioProjectEntity;
import com.omarabusahmoud.portfolio.project.entity.ProjectReviewInvitationEntity;
import com.omarabusahmoud.portfolio.project.model.ProjectTone;
import com.omarabusahmoud.portfolio.project.repository.PortfolioProjectRepository;
import com.omarabusahmoud.portfolio.project.repository.ProjectReviewInvitationRepository;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookUserService;
import org.springframework.security.core.Authentication;
import org.junit.jupiter.api.Test;

class ProjectReviewInvitationServiceTests {
    @Test
    void findsReviewInvitationForAnUnpublishedProject() {
        Instant now = Instant.parse("2026-08-10T10:00:00Z");
        PortfolioProjectRepository projects = mock(PortfolioProjectRepository.class);
        ProjectReviewInvitationRepository invitations = mock(ProjectReviewInvitationRepository.class);
        GuestbookUserService users = mock(GuestbookUserService.class);
        PortfolioProjectEntity project = project(now);
        ProjectReviewInvitationEntity invitation = new ProjectReviewInvitationEntity(
                UUID.randomUUID(), project, "a".repeat(64), now.plusSeconds(3600), now);
        when(invitations.findByTokenHash(anyString())).thenReturn(Optional.of(invitation));
        ProjectReviewInvitationService service = new ProjectReviewInvitationService(
                invitations, projects, Clock.fixed(now, ZoneOffset.UTC), users);

        var response = service.find("secure-review-token-that-is-long-enough-12345");

        assertThat(project.isPublished()).isFalse();
        assertThat(response.projectId()).isEqualTo(project.getId());
        assertThat(response.projectTitle()).isEqualTo("Example Project");
    }

    @Test
    void appliesAReviewAndConsumesTheOneTimeInvitation() {
        Instant now = Instant.parse("2026-08-10T10:00:00Z");
        PortfolioProjectRepository projects = mock(PortfolioProjectRepository.class);
        ProjectReviewInvitationRepository invitations = mock(ProjectReviewInvitationRepository.class);
        GuestbookUserService users = mock(GuestbookUserService.class);
        Authentication authentication = mock(Authentication.class);
        GuestbookUserEntity user = new GuestbookUserEntity(UUID.randomUUID(), "google", "customer-1",
                "Customer Name", "https://example.com/avatar.png", now);
        PortfolioProjectEntity project = project(now);
        ProjectReviewInvitationEntity invitation = new ProjectReviewInvitationEntity(
                UUID.randomUUID(), project, "a".repeat(64), now.plusSeconds(3600), now);
        when(invitations.findLockedByTokenHash(anyString())).thenReturn(Optional.of(invitation));
        when(users.resolve(authentication)).thenReturn(user);
        ProjectReviewInvitationService service = new ProjectReviewInvitationService(
                invitations, projects, Clock.fixed(now, ZoneOffset.UTC), users);

        service.submit("secure-review-token-that-is-long-enough-12345",
                new SubmitProjectReviewRequest(BigDecimal.valueOf(4.5),
                        "A clear and thoughtful customer review."), authentication);

        assertThat(project.getCustomerName()).isEqualTo("Customer Name");
        assertThat(project.getCustomerRating()).isEqualByComparingTo("4.5");
        assertThat(project.getCustomerReview()).contains("thoughtful");
        assertThat(project.getCustomerPhoto()).isEqualTo("https://example.com/avatar.png");
        assertThat(project.isPublished()).isFalse();
        assertThat(invitation.isAvailable(now)).isFalse();
        verify(projects).save(project);
        verify(invitations).save(invitation);
    }

    private PortfolioProjectEntity project(Instant now) {
        return new PortfolioProjectEntity(UUID.randomUUID(), new UpsertProjectRequest(
                "Example Project", "Example", "Project", "Web application", "Project description",
                "/projects/project1.png", null, "Project interface", 1200, 800, "center top", null, null,
                ProjectTone.LIME, List.of("Next.js"), "The original problem.", "The implemented solution.",
                "The measured result.", "Old Customer", "/projects/project1.png",
                "Customer image", BigDecimal.valueOf(5), "The original review text.", false), 0, now);
    }
}
