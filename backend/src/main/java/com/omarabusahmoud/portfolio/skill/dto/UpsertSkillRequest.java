package com.omarabusahmoud.portfolio.skill.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertSkillRequest(
        @NotBlank @Size(max = 80) String name,
        @Size(max = 80) String category,
        @NotBlank @Size(max = 500) String logoUrl,
        @Size(max = 255) String logoPublicId,
        boolean published) {}
