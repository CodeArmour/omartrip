package com.omarabusahmoud.portfolio.project.dto;

import java.math.BigDecimal;

public record ProjectReviewResponse(
        String customerName,
        String customerPhoto,
        String customerPhotoAlt,
        BigDecimal rating,
        String review) {}
