package com.omarabusahmoud.portfolio.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBlogCommentRequest(
        @NotBlank @Size(min = 2, max = 1000) String content) { }
