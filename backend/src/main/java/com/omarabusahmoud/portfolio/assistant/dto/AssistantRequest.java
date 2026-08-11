package com.omarabusahmoud.portfolio.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssistantRequest(
        @NotBlank @Size(max = 500) String message) {
}
