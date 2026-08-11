package com.omarabusahmoud.portfolio.booking.dto;

import java.util.List;

public record AvailabilityResponse(
        String mode,
        boolean configured,
        String timezone,
        String utcOffset,
        int durationMinutes,
        List<String> availableDates,
        List<AvailableSlot> slots) {
}
