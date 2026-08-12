package com.omarabusahmoud.portfolio.blog.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.blog.entity.BlogPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPostEntity, UUID> {
    List<BlogPostEntity> findAllByPublishedTrueOrderByPublishedAtDescCreatedAtDesc();
    List<BlogPostEntity> findAllByOrderByCreatedAtDesc();
    Optional<BlogPostEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, UUID id);
}
