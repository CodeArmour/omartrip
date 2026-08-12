package com.omarabusahmoud.portfolio.project.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "portfolio.cloudinary")
public record CloudinaryProperties(
        String cloudName,
        String apiKey,
        String apiSecret,
        String folder,
        String skillFolder,
        String profileFolder,
        String blogFolder) {
    public boolean configured() {
        return hasText(cloudName) && hasText(apiKey) && hasText(apiSecret);
    }

    public String safeFolder() {
        return hasText(folder) ? folder.trim() : "omar-portfolio/projects";
    }
    public String safeSkillFolder() {
        return hasText(skillFolder) ? skillFolder.trim() : "omar-portfolio/skills";
    }
    public String safeProfileFolder() {
        return hasText(profileFolder) ? profileFolder.trim() : "omar-portfolio/profile";
    }
    public String safeBlogFolder() {
        return hasText(blogFolder) ? blogFolder.trim() : "omar-portfolio/blog";
    }

    private boolean hasText(String value) { return value != null && !value.isBlank(); }
}
