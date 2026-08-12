package com.omarabusahmoud.portfolio.blog.entity;

import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "blog_comments")
public class BlogCommentEntity {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private BlogPostEntity post;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private GuestbookUserEntity user;
    @Column(nullable = false, length = 1000)
    private String content;
    @Column(nullable = false)
    private boolean hidden;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected BlogCommentEntity() { }

    public BlogCommentEntity(UUID id, BlogPostEntity post, GuestbookUserEntity user, String content, Instant now) {
        this.id = id;
        this.post = post;
        this.user = user;
        this.content = content;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void edit(String content, Instant now) {
        this.content = content;
        this.updatedAt = now;
    }

    public void hide(Instant now) {
        this.hidden = true;
        this.updatedAt = now;
    }

    public UUID getId() { return id; }
    public BlogPostEntity getPost() { return post; }
    public GuestbookUserEntity getUser() { return user; }
    public String getContent() { return content; }
    public boolean isHidden() { return hidden; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
