package com.omarabusahmoud.portfolio.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertBlogPostRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 360) String excerpt,
        @Size(max = 700) String imageUrl,
        @Size(max = 220) String imageAlt,
        @NotBlank @Size(max = 20000) String content,
        @Size(max = 160) String attachmentLabel,
        @Size(max = 700) String attachmentUrl,
        boolean published) { }
