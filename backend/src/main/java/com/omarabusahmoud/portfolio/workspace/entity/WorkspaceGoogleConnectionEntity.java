package com.omarabusahmoud.portfolio.workspace.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "workspace_google_connection")
public class WorkspaceGoogleConnectionEntity {
    @Id private UUID id;
    @Column(name = "account_email", nullable = false, length = 255) private String accountEmail;
    @Column(name = "encrypted_refresh_token", nullable = false, columnDefinition = "TEXT") private String encryptedRefreshToken;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected WorkspaceGoogleConnectionEntity() {}

    public WorkspaceGoogleConnectionEntity(UUID id, String accountEmail, String encryptedRefreshToken, Instant now) {
        this.id = id; this.accountEmail = accountEmail; this.encryptedRefreshToken = encryptedRefreshToken;
        this.createdAt = now; this.updatedAt = now;
    }

    public void update(String encryptedRefreshToken, Instant now) {
        this.encryptedRefreshToken = encryptedRefreshToken; this.updatedAt = now;
    }

    public UUID getId() { return id; }
    public String getAccountEmail() { return accountEmail; }
    public String getEncryptedRefreshToken() { return encryptedRefreshToken; }
    public Instant getUpdatedAt() { return updatedAt; }
}
