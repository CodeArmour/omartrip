package com.omarabusahmoud.portfolio.project.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitProjectReviewRequest(
        @NotNull @DecimalMin("1.0") @DecimalMax("5.0") BigDecimal rating,
        @NotBlank @Size(min = 10, max = 1000) String review) {}
