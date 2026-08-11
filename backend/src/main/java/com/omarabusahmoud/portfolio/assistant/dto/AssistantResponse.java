package com.omarabusahmoud.portfolio.assistant.dto;

public record AssistantResponse(
        String message,
        String actionLabel,
        String target,
        String mode) {
}
