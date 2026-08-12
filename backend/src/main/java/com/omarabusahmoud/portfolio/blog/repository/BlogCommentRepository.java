package com.omarabusahmoud.portfolio.blog.repository;

import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.blog.entity.BlogCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogCommentRepository extends JpaRepository<BlogCommentEntity, UUID> {
    List<BlogCommentEntity> findAllByPostIdAndHiddenFalseOrderByCreatedAtDesc(UUID postId);
    long countByPostIdAndHiddenFalse(UUID postId);
}
