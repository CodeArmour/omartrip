package com.omarabusahmoud.portfolio.blog.dto;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.blog.entity.BlogPostEntity;

public record BlogPostSummaryResponse(
        UUID id,
        String slug,
        String title,
        String excerpt,
        String imageUrl,
        String imageAlt,
        boolean published,
        long likeCount,
        long shareCount,
        long commentCount,
        Instant publishedAt,
        Instant updatedAt) {
    public static BlogPostSummaryResponse from(BlogPostEntity post, long likeCount, long commentCount) {
        return new BlogPostSummaryResponse(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                post.getExcerpt(),
                post.getImageUrl(),
                post.getImageAlt(),
                post.isPublished(),
                likeCount,
                post.getShareCount(),
                commentCount,
                post.getPublishedAt(),
                post.getUpdatedAt());
    }
}
