package com.omarabusahmoud.portfolio.booking.dto;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateBookingRequest(
        @NotNull Instant startsAt,
        @NotBlank @Size(min = 2, max = 80) String fullName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 10, max = 300) String topic,
        @NotBlank @Size(min = 8, max = 80) String idempotencyKey,
        @Size(max = 100) String company) {
}
