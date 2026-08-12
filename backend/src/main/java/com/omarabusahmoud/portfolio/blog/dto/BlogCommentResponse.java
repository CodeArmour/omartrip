package com.omarabusahmoud.portfolio.blog.dto;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.blog.entity.BlogCommentEntity;

public record BlogCommentResponse(
        UUID id,
        String content,
        BlogAuthorResponse author,
        long likeCount,
        boolean likedByViewer,
        boolean ownedByViewer,
        boolean edited,
        Instant createdAt,
        Instant updatedAt) {
    public static BlogCommentResponse from(
            BlogCommentEntity comment,
            long likeCount,
            boolean likedByViewer,
            boolean ownedByViewer) {
        return new BlogCommentResponse(
                comment.getId(),
                comment.getContent(),
                BlogAuthorResponse.from(comment.getUser()),
                likeCount,
                likedByViewer,
                ownedByViewer,
                comment.getUpdatedAt().isAfter(comment.getCreatedAt().plusSeconds(1)),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }
}
