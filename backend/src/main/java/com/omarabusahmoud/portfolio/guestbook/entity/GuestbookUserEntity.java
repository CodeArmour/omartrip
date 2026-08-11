package com.omarabusahmoud.portfolio.guestbook.entity;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "guestbook_users", uniqueConstraints =
        @UniqueConstraint(name = "uq_guestbook_users_provider_identity", columnNames = {"provider", "provider_id"}))
public class GuestbookUserEntity {
    @Id
    private UUID id;
    @Column(nullable = false, length = 24)
    private String provider;
    @Column(name = "provider_id", nullable = false, length = 191)
    private String providerId;
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GuestbookUserEntity() { }

    public GuestbookUserEntity(UUID id, String provider, String providerId, String displayName,
            String avatarUrl, Instant createdAt) {
        this.id = id;
        this.provider = provider;
        this.providerId = providerId;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public void updateProfile(String displayName, String avatarUrl, Instant updatedAt) {
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getAvatarUrl() { return avatarUrl; }
}
