package com.omarabusahmoud.portfolio.blog.entity;

import java.time.Instant;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Table(name = "blog_post_likes")
@IdClass(BlogPostLikeId.class)
public class BlogPostLikeEntity {
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private BlogPostEntity post;
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private GuestbookUserEntity user;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected BlogPostLikeEntity() { }
    public BlogPostLikeEntity(BlogPostEntity post, GuestbookUserEntity user, Instant createdAt) {
        this.post = post;
        this.user = user;
        this.createdAt = createdAt;
    }
}
