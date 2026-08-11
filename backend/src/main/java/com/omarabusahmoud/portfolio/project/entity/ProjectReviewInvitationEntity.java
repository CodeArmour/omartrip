package com.omarabusahmoud.portfolio.project.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_review_invitations")
public class ProjectReviewInvitationEntity {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private PortfolioProjectEntity project;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64) private String tokenHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "used_at") private Instant usedAt;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    protected ProjectReviewInvitationEntity() {}

    public ProjectReviewInvitationEntity(UUID id, PortfolioProjectEntity project, String tokenHash, Instant expiresAt, Instant createdAt) {
        this.id = id;
        this.project = project;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public boolean isAvailable(Instant now) { return usedAt == null && expiresAt.isAfter(now); }
    public void consume(Instant now) { usedAt = now; }
    public PortfolioProjectEntity getProject() { return project; }
    public Instant getExpiresAt() { return expiresAt; }
}
