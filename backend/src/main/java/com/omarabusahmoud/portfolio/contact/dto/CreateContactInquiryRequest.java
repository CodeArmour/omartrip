package com.omarabusahmoud.portfolio.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactInquiryRequest(
        @NotBlank @Size(min = 2, max = 80) String fullName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 3, max = 120) String subject,
        @NotBlank @Size(min = 10, max = 2000) String message,
        @NotBlank @Size(min = 8, max = 80) String idempotencyKey,
        @Size(max = 100) String company) {
}
