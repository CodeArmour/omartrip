package com.omarabusahmoud.portfolio.skill.dto;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.skill.entity.PortfolioSkillEntity;

public record PortfolioSkillResponse(
        UUID id,
        String name,
        String category,
        String logo,
        String logoPublicId,
        int displayOrder,
        boolean published,
        Instant updatedAt) {
    public static PortfolioSkillResponse from(PortfolioSkillEntity skill) {
        return new PortfolioSkillResponse(skill.getId(), skill.getName(), skill.getCategory(), skill.getLogoUrl(),
                skill.getLogoPublicId(), skill.getDisplayOrder(), skill.isPublished(), skill.getUpdatedAt());
    }
}
