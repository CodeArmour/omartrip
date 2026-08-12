package com.omarabusahmoud.portfolio.blog.controller;

import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.blog.dto.BlogPostDetailResponse;
import com.omarabusahmoud.portfolio.blog.dto.BlogPostSummaryResponse;
import com.omarabusahmoud.portfolio.blog.dto.UpsertBlogPostRequest;
import com.omarabusahmoud.portfolio.blog.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/blog/admin/posts")
public class BlogAdminController {
    private final BlogService blog;
    private final PortfolioAuthorizationService authorization;

    public BlogAdminController(
            BlogService blog,
            PortfolioAuthorizationService authorization) {
        this.blog = blog;
        this.authorization = authorization;
    }

    @GetMapping
    public List<BlogPostSummaryResponse> posts(Authentication authentication) {
        authorization.requireOwner(authentication);
        return blog.adminPosts();
    }

    @PostMapping
    public ResponseEntity<BlogPostDetailResponse> create(
            Authentication authentication,
            @Valid @RequestBody UpsertBlogPostRequest request) {
        authorization.requireOwner(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(blog.create(request));
    }

    @PutMapping("/{id}")
    public BlogPostDetailResponse update(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody UpsertBlogPostRequest request) {
        authorization.requireOwner(authentication);
        return blog.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        authorization.requireOwner(authentication);
        blog.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
