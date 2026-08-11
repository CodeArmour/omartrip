package com.omarabusahmoud.portfolio.skill.entity;

import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.skill.dto.UpsertSkillRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "portfolio_skills")
public class PortfolioSkillEntity {
    @Id private UUID id;
    @Column(nullable = false, length = 80) private String name;
    @Column(length = 80) private String category;
    @Column(name = "logo_url", nullable = false, length = 500) private String logoUrl;
    @Column(name = "logo_public_id", length = 255) private String logoPublicId;
    @Column(name = "display_order", nullable = false) private int displayOrder;
    @Column(nullable = false) private boolean published;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected PortfolioSkillEntity() {}

    public PortfolioSkillEntity(UUID id, UpsertSkillRequest request, int displayOrder, Instant now) {
        this.id = id;
        this.displayOrder = displayOrder;
        this.createdAt = now;
        apply(request, now);
    }

    public void apply(UpsertSkillRequest request, Instant now) {
        name = request.name().trim();
        category = request.category() == null || request.category().isBlank() ? null : request.category().trim();
        logoUrl = request.logoUrl().trim();
        logoPublicId = request.logoPublicId() == null || request.logoPublicId().isBlank() ? null : request.logoPublicId().trim();
        published = request.published();
        updatedAt = now;
    }

    public void reorder(int order, Instant now) { displayOrder = order; updatedAt = now; }
    public void setPublished(boolean value, Instant now) { published = value; updatedAt = now; }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getLogoUrl() { return logoUrl; }
    public String getLogoPublicId() { return logoPublicId; }
    public int getDisplayOrder() { return displayOrder; }
    public boolean isPublished() { return published; }
    public Instant getUpdatedAt() { return updatedAt; }
}
