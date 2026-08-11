package com.omarabusahmoud.portfolio.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CloudinaryUploadApiResponse(
        @JsonProperty("secure_url") String secureUrl,
        @JsonProperty("public_id") String publicId,
        int width,
        int height) {}
