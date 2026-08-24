package com.omarabusahmoud.portfolio.project.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.project.dto.UpsertProjectRequest;
import com.omarabusahmoud.portfolio.project.model.ProjectTone;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "portfolio_projects")
public class PortfolioProjectEntity {
    @Id private UUID id;
    @Column(nullable = false, length = 120) private String title;
    @Column(name = "title_line_one", nullable = false, length = 80) private String titleLineOne;
    @Column(name = "title_line_two", nullable = false, length = 80) private String titleLineTwo;
    @Column(nullable = false, length = 80) private String category;
    @Column(nullable = false, length = 600) private String description;
    @Column(name = "image_path", nullable = false, length = 500) private String imagePath;
    @Column(name = "image_public_id", length = 255) private String imagePublicId;
    @Column(name = "image_alt", nullable = false, length = 240) private String imageAlt;
    @Column(name = "image_width", nullable = false) private int imageWidth;
    @Column(name = "image_height", nullable = false) private int imageHeight;
    @Column(name = "image_position", nullable = false, length = 80) private String imagePosition;
    @Column(name = "live_url", length = 500) private String liveUrl;
    @Column(name = "repository_url", length = 500) private String repositoryUrl;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private ProjectTone tone;
    @Column(name = "case_study_problem", nullable = false, length = 1400) private String caseStudyProblem;
    @Column(name = "case_study_solution", nullable = false, length = 1400) private String caseStudySolution;
    @Column(name = "case_study_result", nullable = false, length = 1400) private String caseStudyResult;
    @Column(name = "customer_name", nullable = false, length = 120) private String customerName;
    @Column(name = "customer_photo", nullable = false, length = 500) private String customerPhoto;
    @Column(name = "customer_photo_alt", nullable = false, length = 240) private String customerPhotoAlt;
    @Column(name = "customer_rating", nullable = false, precision = 2, scale = 1) private BigDecimal customerRating;
    @Column(name = "customer_review", nullable = false, length = 1000) private String customerReview;
    @Column(name = "display_order", nullable = false) private int displayOrder;
    @Column(nullable = false) private boolean published;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "portfolio_project_technologies", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "technology_order")
    @Column(name = "technology", nullable = false, length = 80)
    private List<String> technologies = new ArrayList<>();

    protected PortfolioProjectEntity() {}

    public PortfolioProjectEntity(UUID id, UpsertProjectRequest request, int displayOrder, Instant now) {
        this.id = id;
        this.displayOrder = displayOrder;
        this.createdAt = now;
        apply(request, now);
    }

    public void apply(UpsertProjectRequest request, Instant now) {
        title = request.title().trim();
        titleLineOne = request.titleLineOne().trim();
        titleLineTwo = request.titleLineTwo().trim();
        category = request.category().trim();
        description = request.description().trim();
        imagePath = request.imagePath().trim();
        imagePublicId = cleanNullable(request.imagePublicId());
        imageAlt = request.imageAlt().trim();
        imageWidth = request.imageWidth();
        imageHeight = request.imageHeight();
        imagePosition = request.imagePosition().trim();
        liveUrl = cleanNullable(request.liveUrl());
        repositoryUrl = cleanNullable(request.repositoryUrl());
        tone = request.tone();
        caseStudyProblem = request.caseStudyProblem().trim();
        caseStudySolution = request.caseStudySolution().trim();
        caseStudyResult = request.caseStudyResult().trim();
        customerName = request.customerName().trim();
        customerPhoto = request.customerPhoto().trim();
        customerPhotoAlt = request.customerPhotoAlt().trim();
        customerRating = request.customerRating();
        customerReview = request.customerReview().trim();
        technologies.clear();
        technologies.addAll(request.technologies().stream().map(String::trim).filter(value -> !value.isBlank()).distinct().toList());
        published = request.published();
        updatedAt = now;
    }

    private String cleanNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public void reorder(int value, Instant now) { displayOrder = value; updatedAt = now; }
    public void setPublished(boolean value, Instant now) { published = value; updatedAt = now; }
    public void applyCustomerReview(String name, String avatarUrl, BigDecimal rating, String review, Instant now) {
        customerName = name;
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            customerPhoto = avatarUrl;
            customerPhotoAlt = "Profile photo of " + name;
        }
        customerRating = rating;
        customerReview = review;
        updatedAt = now;
    }
    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getTitleLineOne() { return titleLineOne; }
    public String getTitleLineTwo() { return titleLineTwo; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getImagePath() { return imagePath; }
    public String getImagePublicId() { return imagePublicId; }
    public String getImageAlt() { return imageAlt; }
    public int getImageWidth() { return imageWidth; }
    public int getImageHeight() { return imageHeight; }
    public String getImagePosition() { return imagePosition; }
    public String getLiveUrl() { return liveUrl; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public ProjectTone getTone() { return tone; }
    public String getCaseStudyProblem() { return caseStudyProblem; }
    public String getCaseStudySolution() { return caseStudySolution; }
    public String getCaseStudyResult() { return caseStudyResult; }
    public String getCustomerName() { return customerName; }
    public String getCustomerPhoto() { return customerPhoto; }
    public String getCustomerPhotoAlt() { return customerPhotoAlt; }
    public BigDecimal getCustomerRating() { return customerRating; }
    public String getCustomerReview() { return customerReview; }
    public int getDisplayOrder() { return displayOrder; }
    public boolean isPublished() { return published; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<String> getTechnologies() { return List.copyOf(technologies); }
}
