package com.omarabusahmoud.portfolio.blog.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import com.omarabusahmoud.portfolio.blog.entity.BlogPostEntity;

public record BlogPostDetailResponse(
        UUID id,
        String slug,
        String title,
        String excerpt,
        String imageUrl,
        String imageAlt,
        String content,
        String attachmentLabel,
        String attachmentUrl,
        boolean published,
        long likeCount,
        long shareCount,
        boolean likedByViewer,
        List<BlogCommentResponse> comments,
        Instant publishedAt,
        Instant updatedAt) {
    public static BlogPostDetailResponse from(
            BlogPostEntity post,
            long likeCount,
            boolean likedByViewer,
            List<BlogCommentResponse> comments) {
        return new BlogPostDetailResponse(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                post.getExcerpt(),
                post.getImageUrl(),
                post.getImageAlt(),
                post.getContent(),
                post.getAttachmentLabel(),
                post.getAttachmentUrl(),
                post.isPublished(),
                likeCount,
                post.getShareCount(),
                likedByViewer,
                comments,
                post.getPublishedAt(),
                post.getUpdatedAt());
    }
}
