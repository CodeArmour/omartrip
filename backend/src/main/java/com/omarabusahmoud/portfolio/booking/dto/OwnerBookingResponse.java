package com.omarabusahmoud.portfolio.booking.dto;

import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.model.BookingStatus;

public record OwnerBookingResponse(
        UUID id,
        Instant startsAt,
        Instant endsAt,
        String fullName,
        String email,
        String topic,
        BookingStatus status,
        String calendarEventId,
        String googleMeetUrl,
        Instant createdAt,
        Instant updatedAt) {

    public static OwnerBookingResponse from(BookingRequestEntity booking) {
        return new OwnerBookingResponse(
                booking.getId(), booking.getStartsAt(), booking.getEndsAt(), booking.getFullName(),
                booking.getEmail(), booking.getTopic(), booking.getStatus(), booking.getCalendarEventId(),
                booking.getGoogleMeetUrl(), booking.getCreatedAt(), booking.getUpdatedAt());
    }
}
