package com.omarabusahmoud.portfolio.blog.repository;

import java.util.UUID;

import com.omarabusahmoud.portfolio.blog.entity.BlogPostLikeEntity;
import com.omarabusahmoud.portfolio.blog.entity.BlogPostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostLikeRepository extends JpaRepository<BlogPostLikeEntity, BlogPostLikeId> {
    long countByPostId(UUID postId);
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    void deleteByPostIdAndUserId(UUID postId, UUID userId);
}
