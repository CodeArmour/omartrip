package com.omarabusahmoud.portfolio.guestbook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGuestbookMessageRequest(
        @NotBlank @Size(min = 2, max = 280) String content) {
}
