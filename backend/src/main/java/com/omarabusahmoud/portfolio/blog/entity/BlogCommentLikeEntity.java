package com.omarabusahmoud.portfolio.blog.entity;

import java.time.Instant;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "blog_comment_likes")
@IdClass(BlogCommentLikeId.class)
public class BlogCommentLikeEntity {
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private BlogCommentEntity comment;
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private GuestbookUserEntity user;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected BlogCommentLikeEntity() { }
    public BlogCommentLikeEntity(BlogCommentEntity comment, GuestbookUserEntity user, Instant createdAt) {
        this.comment = comment;
        this.user = user;
        this.createdAt = createdAt;
    }
}
