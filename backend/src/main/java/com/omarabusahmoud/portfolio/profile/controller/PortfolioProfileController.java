package com.omarabusahmoud.portfolio.profile.controller;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.profile.dto.PortfolioProfileResponse;
import com.omarabusahmoud.portfolio.profile.dto.UpsertProfileRequest;
import com.omarabusahmoud.portfolio.profile.service.PortfolioProfileService;
import com.omarabusahmoud.portfolio.project.dto.ProjectImageUploadResponse;
import com.omarabusahmoud.portfolio.project.service.CloudinaryProjectImageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/profile")
public class PortfolioProfileController {
    private final PortfolioProfileService profiles;
    private final PortfolioAuthorizationService authorization;
    private final CloudinaryProjectImageService images;

    public PortfolioProfileController(PortfolioProfileService profiles, PortfolioAuthorizationService authorization,
            CloudinaryProjectImageService images) {
        this.profiles = profiles;
        this.authorization = authorization;
        this.images = images;
    }

    @GetMapping
    public PortfolioProfileResponse publicProfile() { return profiles.get(); }

    @PutMapping("/admin")
    public PortfolioProfileResponse update(@Valid @RequestBody UpsertProfileRequest request, Authentication auth) {
        authorization.requireOwner(auth);
        return profiles.update(request);
    }

    @PostMapping(value = "/admin/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectImageUploadResponse upload(@RequestPart("file") MultipartFile file, Authentication auth) {
        authorization.requireOwner(auth);
        return images.uploadProfile(file);
    }
}
