package com.omarabusahmoud.portfolio.guestbook.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "portfolio.guestbook")
public record GuestbookProperties(
        int maxMessagesPerHour,
        int duplicateWindowMinutes,
        List<String> adminGithubLogins) {
    public GuestbookProperties {
        if (maxMessagesPerHour < 1 || duplicateWindowMinutes < 1) {
            throw new IllegalArgumentException("Invalid guestbook protection configuration");
        }
        adminGithubLogins = List.copyOf(adminGithubLogins);
    }
}
