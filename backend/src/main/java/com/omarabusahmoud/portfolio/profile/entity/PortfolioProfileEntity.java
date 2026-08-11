package com.omarabusahmoud.portfolio.profile.entity;

import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.profile.dto.UpsertProfileRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "portfolio_profile")
public class PortfolioProfileEntity {
    @Id private UUID id;
    @Column(name = "full_name", nullable = false, length = 120) private String fullName;
    @Column(nullable = false, length = 120) private String role;
    @Column(nullable = false, length = 160) private String location;
    @Column(name = "hero_eyebrow", nullable = false, length = 160) private String heroEyebrow;
    @Column(name = "hero_supporting", nullable = false, length = 500) private String heroSupporting;
    @Column(name = "about_bio", nullable = false, length = 1000) private String aboutBio;
    @Column(nullable = false, length = 500) private String services;
    @Column(name = "portrait_url", nullable = false, length = 500) private String portraitUrl;
    @Column(name = "portrait_public_id", length = 255) private String portraitPublicId;
    @Column(name = "open_to_collaboration", nullable = false) private boolean openToCollaboration;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(nullable = false, length = 255) private String email;
    @Column(name = "github_url", nullable = false, length = 500) private String githubUrl;
    @Column(name = "linkedin_url", nullable = false, length = 500) private String linkedinUrl;

    protected PortfolioProfileEntity() {}

    public PortfolioProfileEntity(UUID id, UpsertProfileRequest request, Instant now) {
        this.id = id;
        apply(request, now);
    }

    public void apply(UpsertProfileRequest request, Instant now) {
        fullName = request.fullName().trim(); role = request.role().trim(); location = request.location().trim();
        heroEyebrow = request.heroEyebrow().trim(); heroSupporting = request.heroSupporting().trim();
        aboutBio = request.aboutBio().trim(); services = request.services().trim(); portraitUrl = request.portraitUrl().trim();
        portraitPublicId = request.portraitPublicId() == null || request.portraitPublicId().isBlank() ? null : request.portraitPublicId().trim();
        openToCollaboration = request.openToCollaboration(); updatedAt = now;
        email = request.email().trim(); githubUrl = request.githubUrl().trim(); linkedinUrl = request.linkedinUrl().trim();
    }

    public UUID getId() { return id; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public String getLocation() { return location; }
    public String getHeroEyebrow() { return heroEyebrow; }
    public String getHeroSupporting() { return heroSupporting; }
    public String getAboutBio() { return aboutBio; }
    public String getServices() { return services; }
    public String getPortraitUrl() { return portraitUrl; }
    public String getPortraitPublicId() { return portraitPublicId; }
    public boolean isOpenToCollaboration() { return openToCollaboration; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getEmail() { return email; }
    public String getGithubUrl() { return githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
}
