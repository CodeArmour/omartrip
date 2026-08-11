package com.omarabusahmoud.portfolio.project.dto;

import java.time.Instant;

public record ReviewInvitationCreatedResponse(String token, Instant expiresAt) {}
