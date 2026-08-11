package com.omarabusahmoud.portfolio.contact.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "portfolio.contact")
public record ContactProperties(int maxSubmissionsPerHour) {
    public ContactProperties {
        if (maxSubmissionsPerHour < 1) {
            throw new IllegalArgumentException("maxSubmissionsPerHour must be positive");
        }
    }
}
