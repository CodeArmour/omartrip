package com.omarabusahmoud.portfolio.guestbook.entity;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.model.GuestbookMessageStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "guestbook_messages")
public class GuestbookMessageEntity {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private GuestbookUserEntity user;
    @Column(nullable = false, length = 280)
    private String content;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private GuestbookMessageStatus status;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GuestbookMessageEntity() { }

    public GuestbookMessageEntity(UUID id, GuestbookUserEntity user, String content, Instant createdAt) {
        this.id = id;
        this.user = user;
        this.content = content;
        this.status = GuestbookMessageStatus.PENDING;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public void edit(String content, Instant updatedAt) {
        this.content = content;
        this.status = GuestbookMessageStatus.PENDING;
        this.updatedAt = updatedAt;
    }

    public void hide(Instant updatedAt) {
        this.status = GuestbookMessageStatus.HIDDEN;
        this.updatedAt = updatedAt;
    }

    public void approve(Instant updatedAt) {
        this.status = GuestbookMessageStatus.VISIBLE;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public GuestbookUserEntity getUser() { return user; }
    public String getContent() { return content; }
    public GuestbookMessageStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
