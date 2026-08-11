package com.omarabusahmoud.portfolio.project.controller;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.project.dto.ProjectImageUploadResponse;
import com.omarabusahmoud.portfolio.project.service.CloudinaryProjectImageService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/projects/admin/images")
public class ProjectImageController {
    private final CloudinaryProjectImageService images;
    private final PortfolioAuthorizationService authorization;

    public ProjectImageController(CloudinaryProjectImageService images, PortfolioAuthorizationService authorization) {
        this.images = images;
        this.authorization = authorization;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectImageUploadResponse upload(@RequestPart("file") MultipartFile file, Authentication authentication) {
        authorization.requireOwner(authentication);
        return images.upload(file);
    }
}
