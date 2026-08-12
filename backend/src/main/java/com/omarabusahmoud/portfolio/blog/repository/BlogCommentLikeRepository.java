package com.omarabusahmoud.portfolio.blog.repository;

import java.util.UUID;

import com.omarabusahmoud.portfolio.blog.entity.BlogCommentLikeEntity;
import com.omarabusahmoud.portfolio.blog.entity.BlogCommentLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogCommentLikeRepository extends JpaRepository<BlogCommentLikeEntity, BlogCommentLikeId> {
    long countByCommentId(UUID commentId);
    boolean existsByCommentIdAndUserId(UUID commentId, UUID userId);
    void deleteByCommentIdAndUserId(UUID commentId, UUID userId);
}
