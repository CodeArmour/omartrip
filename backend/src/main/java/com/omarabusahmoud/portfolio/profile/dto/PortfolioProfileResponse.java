package com.omarabusahmoud.portfolio.profile.dto;

import java.time.Instant;
import com.omarabusahmoud.portfolio.profile.entity.PortfolioProfileEntity;

public record PortfolioProfileResponse(String fullName, String role, String location, String heroEyebrow,
        String heroSupporting, String aboutBio, String services, String portraitUrl, String portraitPublicId,
        boolean openToCollaboration, String email, String githubUrl, String linkedinUrl, Instant updatedAt) {
    public static PortfolioProfileResponse from(PortfolioProfileEntity p) {
        return new PortfolioProfileResponse(p.getFullName(), p.getRole(), p.getLocation(), p.getHeroEyebrow(),
                p.getHeroSupporting(), p.getAboutBio(), p.getServices(), p.getPortraitUrl(), p.getPortraitPublicId(),
                p.isOpenToCollaboration(), p.getEmail(), p.getGithubUrl(), p.getLinkedinUrl(), p.getUpdatedAt());
    }
}
