package com.omarabusahmoud.portfolio.blog.entity;

import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.blog.dto.UpsertBlogPostRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "blog_posts")
public class BlogPostEntity {
    @Id
    private UUID id;
    @Column(nullable = false, unique = true, length = 160)
    private String slug;
    @Column(nullable = false, length = 180)
    private String title;
    @Column(nullable = false, length = 360)
    private String excerpt;
    @Column(name = "image_url", length = 700)
    private String imageUrl;
    @Column(name = "image_alt", length = 220)
    private String imageAlt;
    @Column(nullable = false)
    private String content;
    @Column(name = "attachment_label", length = 160)
    private String attachmentLabel;
    @Column(name = "attachment_url", length = 700)
    private String attachmentUrl;
    @Column(nullable = false)
    private boolean published;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @Column(name = "published_at")
    private Instant publishedAt;
    @Column(name = "share_count", nullable = false)
    private long shareCount;

    protected BlogPostEntity() { }

    public BlogPostEntity(UUID id, UpsertBlogPostRequest request, String slug, Instant now) {
        this.id = id;
        this.createdAt = now;
        apply(request, slug, now);
    }

    public void apply(UpsertBlogPostRequest request, String slug, Instant now) {
        this.slug = slug;
        this.title = request.title().trim();
        this.excerpt = request.excerpt().trim();
        this.imageUrl = clean(request.imageUrl());
        this.imageAlt = clean(request.imageAlt());
        this.content = request.content().trim();
        this.attachmentLabel = clean(request.attachmentLabel());
        this.attachmentUrl = clean(request.attachmentUrl());
        setPublished(request.published(), now);
        this.updatedAt = now;
    }

    public void setPublished(boolean published, Instant now) {
        if (published && !this.published && this.publishedAt == null) this.publishedAt = now;
        this.published = published;
        this.updatedAt = now;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public UUID getId() { return id; }
    public String getSlug() { return slug; }
    public String getTitle() { return title; }
    public String getExcerpt() { return excerpt; }
    public String getImageUrl() { return imageUrl; }
    public String getImageAlt() { return imageAlt; }
    public String getContent() { return content; }
    public String getAttachmentLabel() { return attachmentLabel; }
    public String getAttachmentUrl() { return attachmentUrl; }
    public boolean isPublished() { return published; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getPublishedAt() { return publishedAt; }
    public long getShareCount() { return shareCount; }
    public void incrementShareCount() { this.shareCount++; }
}
