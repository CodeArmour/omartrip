package com.omarabusahmoud.portfolio.workspace.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("portfolio.workspace.google")
public record WorkspaceGoogleProperties(
        String email,
        String clientId,
        String clientSecret,
        String encryptionKey) {
    public boolean configured() {
        return hasText(email) && hasText(clientId) && hasText(clientSecret) && hasText(encryptionKey);
    }

    private boolean hasText(String value) { return value != null && !value.isBlank(); }
}
