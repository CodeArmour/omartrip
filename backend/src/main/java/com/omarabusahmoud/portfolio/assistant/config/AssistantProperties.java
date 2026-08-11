package com.omarabusahmoud.portfolio.assistant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("portfolio.assistant")
public record AssistantProperties(
        String openaiApiKey,
        String model,
        String embeddingModel,
        int maxRequestsPerHour) {

    public boolean openaiConfigured() {
        return openaiApiKey != null && !openaiApiKey.isBlank();
    }
}
