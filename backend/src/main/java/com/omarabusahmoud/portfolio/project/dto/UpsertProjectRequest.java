package com.omarabusahmoud.portfolio.project.dto;

import java.math.BigDecimal;
import java.util.List;

import com.omarabusahmoud.portfolio.project.model.ProjectTone;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpsertProjectRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 80) String titleLineOne,
        @NotBlank @Size(max = 80) String titleLineTwo,
        @NotBlank @Size(max = 80) String category,
        @NotBlank @Size(max = 600) String description,
        @NotBlank @Size(max = 500) String imagePath,
        @Size(max = 255) String imagePublicId,
        @NotBlank @Size(max = 240) String imageAlt,
        @Positive int imageWidth,
        @Positive int imageHeight,
        @NotBlank @Size(max = 80) String imagePosition,
        @Size(max = 500) String liveUrl,
        @Size(max = 500) String repositoryUrl,
        @NotNull ProjectTone tone,
        @NotEmpty @Size(max = 20) List<@NotBlank @Size(max = 80) String> technologies,
        @NotBlank @Size(max = 120) String customerName,
        @NotBlank @Size(max = 500) String customerPhoto,
        @NotBlank @Size(max = 240) String customerPhotoAlt,
        @NotNull @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal customerRating,
        @NotBlank @Size(max = 1000) String customerReview,
        boolean published) {}
