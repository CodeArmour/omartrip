package com.omarabusahmoud.portfolio.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertProfileRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(max = 120) String role,
        @NotBlank @Size(max = 160) String location,
        @NotBlank @Size(max = 160) String heroEyebrow,
        @NotBlank @Size(max = 500) String heroSupporting,
        @NotBlank @Size(max = 1000) String aboutBio,
        @NotBlank @Size(max = 500) String services,
        @NotBlank @Size(max = 500) String portraitUrl,
        @Size(max = 255) String portraitPublicId,
        boolean openToCollaboration,
        @NotBlank @Size(max = 255) String email,
        @NotBlank @Size(max = 500) String githubUrl,
        @NotBlank @Size(max = 500) String linkedinUrl) {}
