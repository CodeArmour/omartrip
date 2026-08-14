package com.omarabusahmoud.portfolio.project.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CloudinaryUploadApiResponse(
        @JsonProperty("secure_url") String secureUrl,
        @JsonProperty("public_id") String publicId,
        Integer width,
        Integer height) {}
