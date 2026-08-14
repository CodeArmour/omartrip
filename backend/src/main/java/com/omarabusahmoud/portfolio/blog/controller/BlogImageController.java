package com.omarabusahmoud.portfolio.blog.controller;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.project.dto.ProjectImageUploadResponse;
import com.omarabusahmoud.portfolio.project.service.CloudinaryProjectImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/blog/admin")
public class BlogImageController {
    private static final Logger log = LoggerFactory.getLogger(BlogImageController.class);
    private final CloudinaryProjectImageService images;
    private final PortfolioAuthorizationService authorization;

    public BlogImageController(CloudinaryProjectImageService images, PortfolioAuthorizationService authorization) {
        this.images = images;
        this.authorization = authorization;
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectImageUploadResponse upload(@RequestPart("file") MultipartFile file, Authentication authentication) {
        authorization.requireOwner(authentication);
        log.info("Blog image upload request received. file={} size={} contentType={}",
                safeName(file), file.getSize(), file.getContentType());
        return images.uploadBlog(file);
    }

    @PostMapping(value = "/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectImageUploadResponse uploadAttachment(@RequestPart("file") MultipartFile file, Authentication authentication) {
        authorization.requireOwner(authentication);
        log.info("Blog attachment upload request received. file={} size={} contentType={}",
                safeName(file), file.getSize(), file.getContentType());
        return images.uploadBlogAttachment(file);
    }

    private String safeName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) return "<unnamed>";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
