package com.omarabusahmoud.portfolio.blog.controller;

import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.blog.dto.BlogLikeResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogPostDetailResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogPostSummaryResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogShareResponse;
import com.omarabusahmoud.portfolio.blog.dto.CreateBlogCommentRequest;
import com.omarabusahmoud.portfolio.blog.dto.BlogCommentResponse;
import com.omarabusahmoud.portfolio.blog.service.BlogService;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/blog")
public class BlogController {
    private final BlogService blog;
    private final GuestbookUserService users;
    private final PortfolioAuthorizationService authorization;

    public BlogController(BlogService blog, GuestbookUserService users, PortfolioAuthorizationService authorization) {
        this.blog = blog;
        this.users = users;
        this.authorization = authorization;
    }

    @GetMapping("/posts")
    public List<BlogPostSummaryResponse> posts() {
        return blog.publicPosts();
    }

    @GetMapping("/posts/{slug}")
    public BlogPostDetailResponse detail(@PathVariable String slug, Authentication authentication) {
        GuestbookUserEntity viewer = authentication == null ? null : safeUser(authentication);
        return blog.detail(slug, viewer, authorization.isOwner(authentication));
    }

    @PostMapping("/posts/{id}/likes")
    public BlogLikeResponse togglePostLike(@PathVariable UUID id, Authentication authentication) {
        return blog.togglePostLike(id, users.resolve(authentication));
    }

    @PostMapping("/posts/{id}/shares")
    public BlogShareResponse recordShare(@PathVariable UUID id) {
        return new BlogShareResponse(blog.recordShare(id));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<BlogCommentResponse> comment(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody CreateBlogCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(blog.createComment(id, users.resolve(authentication), request.content()));
    }

    @PostMapping("/comments/{id}/likes")
    public BlogLikeResponse toggleCommentLike(@PathVariable UUID id, Authentication authentication) {
        return blog.toggleCommentLike(id, users.resolve(authentication));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id, Authentication authentication) {
        blog.deleteComment(id, users.resolve(authentication), authorization.isOwner(authentication));
        return ResponseEntity.noContent().build();
    }

    private GuestbookUserEntity safeUser(Authentication authentication) {
        try {
            return users.resolve(authentication);
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
