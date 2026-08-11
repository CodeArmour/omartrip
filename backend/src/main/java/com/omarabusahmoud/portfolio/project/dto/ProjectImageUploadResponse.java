package com.omarabusahmoud.portfolio.project.dto;

public record ProjectImageUploadResponse(
        String secureUrl,
        String publicId,
        int width,
        int height) {}
