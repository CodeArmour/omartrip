package com.omarabusahmoud.portfolio.booking.dto;

import java.time.Instant;

import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;

public record BookingResult(
        String status,
        Instant startsAt,
        int durationMinutes,
        String email,
        String message) {

    public static BookingResult pending(BookingRequestEntity booking, int durationMinutes) {
        return new BookingResult(
                "pending", booking.getStartsAt(), durationMinutes, booking.getEmail(), null);
    }
}
