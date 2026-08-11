package com.omarabusahmoud.portfolio.project.controller;

import java.util.UUID;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.project.dto.ReviewInvitationCreatedResponse;
import com.omarabusahmoud.portfolio.project.dto.ReviewInvitationResponse;
import com.omarabusahmoud.portfolio.project.dto.SubmitProjectReviewRequest;
import com.omarabusahmoud.portfolio.project.service.ProjectReviewInvitationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectReviewInvitationController {
    private final ProjectReviewInvitationService reviews;
    private final PortfolioAuthorizationService authorization;

    public ProjectReviewInvitationController(ProjectReviewInvitationService reviews, PortfolioAuthorizationService authorization) {
        this.reviews = reviews;
        this.authorization = authorization;
    }

    @PostMapping("/admin/{projectId}/review-invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewInvitationCreatedResponse create(@PathVariable UUID projectId, Authentication authentication) {
        authorization.requireOwner(authentication);
        return reviews.create(projectId);
    }

    @GetMapping("/reviews/{token}")
    public ReviewInvitationResponse find(@PathVariable String token) { return reviews.find(token); }

    @PostMapping("/reviews/{token}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void submit(@PathVariable String token, @Valid @RequestBody SubmitProjectReviewRequest request, Authentication authentication) {
        reviews.submit(token, request, authentication);
    }
}
