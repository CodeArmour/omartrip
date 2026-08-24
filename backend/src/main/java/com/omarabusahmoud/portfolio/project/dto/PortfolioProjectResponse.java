package com.omarabusahmoud.portfolio.project.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.project.entity.PortfolioProjectEntity;

public record PortfolioProjectResponse(
        UUID id,
        String title,
        List<String> titleLines,
        String category,
        String description,
        String image,
        String imagePublicId,
        String imageAlt,
        int imageWidth,
        int imageHeight,
        String imagePosition,
        List<String> technologies,
        String liveUrl,
        String repositoryUrl,
        String tone,
        ProjectCaseStudyResponse caseStudy,
        ProjectReviewResponse customerReview,
        int displayOrder,
        boolean published,
        Instant updatedAt) {
    public static PortfolioProjectResponse from(PortfolioProjectEntity project) {
        return new PortfolioProjectResponse(
                project.getId(), project.getTitle(), List.of(project.getTitleLineOne(), project.getTitleLineTwo()),
                project.getCategory(), project.getDescription(), project.getImagePath(), project.getImagePublicId(), project.getImageAlt(),
                project.getImageWidth(), project.getImageHeight(), project.getImagePosition(), project.getTechnologies(),
                project.getLiveUrl(), project.getRepositoryUrl(), project.getTone().name().toLowerCase(),
                new ProjectCaseStudyResponse(project.getCaseStudyProblem(), project.getCaseStudySolution(),
                        project.getCaseStudyResult()),
                new ProjectReviewResponse(project.getCustomerName(), project.getCustomerPhoto(),
                        project.getCustomerPhotoAlt(), project.getCustomerRating(), project.getCustomerReview()),
                project.getDisplayOrder(), project.isPublished(), project.getUpdatedAt());
    }
}
