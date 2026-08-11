package com.omarabusahmoud.portfolio.booking.dto;

import java.time.Instant;

public record AvailableSlot(Instant startsAt, Instant endsAt) {
}
