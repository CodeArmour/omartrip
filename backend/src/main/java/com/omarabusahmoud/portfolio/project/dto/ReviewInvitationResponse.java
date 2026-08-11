package com.omarabusahmoud.portfolio.project.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewInvitationResponse(
        UUID projectId,
        String projectTitle,
        String projectCategory,
        String projectImage,
        Instant expiresAt) {}
