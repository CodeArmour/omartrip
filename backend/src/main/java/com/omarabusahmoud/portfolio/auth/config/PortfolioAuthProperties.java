package com.omarabusahmoud.portfolio.auth.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("portfolio.auth")
public record PortfolioAuthProperties(
        String frontendBaseUrl,
        List<String> ownerGithubLogins,
        List<String> ownerGoogleEmails) {

    public PortfolioAuthProperties {
        frontendBaseUrl = frontendBaseUrl == null ? "http://localhost:3000" : frontendBaseUrl.replaceAll("/$", "");
        ownerGithubLogins = ownerGithubLogins == null ? List.of() : List.copyOf(ownerGithubLogins);
        ownerGoogleEmails = ownerGoogleEmails == null ? List.of() : List.copyOf(ownerGoogleEmails);
    }
}
