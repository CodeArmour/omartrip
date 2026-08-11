package com.omarabusahmoud.portfolio.project.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import com.omarabusahmoud.portfolio.project.dto.ReviewInvitationCreatedResponse;
import com.omarabusahmoud.portfolio.project.dto.ReviewInvitationResponse;
import com.omarabusahmoud.portfolio.project.dto.SubmitProjectReviewRequest;
import com.omarabusahmoud.portfolio.project.entity.PortfolioProjectEntity;
import com.omarabusahmoud.portfolio.project.entity.ProjectReviewInvitationEntity;
import com.omarabusahmoud.portfolio.project.repository.PortfolioProjectRepository;
import com.omarabusahmoud.portfolio.project.repository.ProjectReviewInvitationRepository;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookUserService;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectReviewInvitationService {
    private static final Duration VALIDITY = Duration.ofDays(30);
    private final ProjectReviewInvitationRepository invitations;
    private final PortfolioProjectRepository projects;
    private final Clock clock;
    private final GuestbookUserService users;
    private final SecureRandom secureRandom = new SecureRandom();

    public ProjectReviewInvitationService(ProjectReviewInvitationRepository invitations, PortfolioProjectRepository projects, Clock clock, GuestbookUserService users) {
        this.invitations = invitations;
        this.projects = projects;
        this.clock = clock;
        this.users = users;
    }

    @Transactional
    public ReviewInvitationCreatedResponse create(UUID projectId) {
        PortfolioProjectEntity project = projects.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project was not found"));
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        Instant now = clock.instant();
        Instant expiresAt = now.plus(VALIDITY);
        invitations.saveAndFlush(new ProjectReviewInvitationEntity(
                UUID.randomUUID(), project, hash(token), expiresAt, now));
        return new ReviewInvitationCreatedResponse(token, expiresAt);
    }

    @Transactional(readOnly = true)
    public ReviewInvitationResponse find(String token) {
        ProjectReviewInvitationEntity invitation = invitations.findByTokenHash(hash(token))
                .orElseThrow(this::unavailable);
        ensureAvailable(invitation);
        PortfolioProjectEntity project = invitation.getProject();
        return new ReviewInvitationResponse(project.getId(), project.getTitle(), project.getCategory(), project.getImagePath(), invitation.getExpiresAt());
    }

    @Transactional
    public void submit(String token, SubmitProjectReviewRequest request, Authentication authentication) {
        ProjectReviewInvitationEntity invitation = invitations.findLockedByTokenHash(hash(token))
                .orElseThrow(this::unavailable);
        ensureAvailable(invitation);
        GuestbookUserEntity user = users.resolve(authentication);
        Instant now = clock.instant();
        PortfolioProjectEntity project = invitation.getProject();
        project.applyCustomerReview(user.getDisplayName(), user.getAvatarUrl(), request.rating(), request.review().trim(), now);
        invitation.consume(now);
        projects.save(project);
        invitations.save(invitation);
    }

    private void ensureAvailable(ProjectReviewInvitationEntity invitation) {
        if (!invitation.isAvailable(clock.instant())) throw unavailable();
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.GONE, "This review invitation is expired or has already been used");
    }

    private String hash(String token) {
        if (token == null || token.length() < 32 || token.length() > 128) throw unavailable();
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
