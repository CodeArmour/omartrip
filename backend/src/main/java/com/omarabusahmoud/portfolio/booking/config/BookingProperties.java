package com.omarabusahmoud.portfolio.booking.config;

import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("portfolio.booking")
public record BookingProperties(
        String timezone,
        int durationMinutes,
        int bufferBeforeMinutes,
        int bufferAfterMinutes,
        int minimumNoticeHours,
        int maximumAdvanceDays,
        List<AvailabilityRule> availabilityRules) {

    public BookingProperties {
        ZoneId.of(timezone);
        availabilityRules = List.copyOf(availabilityRules);
        if (durationMinutes <= 0 || minimumNoticeHours < 0 || maximumAdvanceDays <= 0) {
            throw new IllegalArgumentException("Invalid booking duration or window configuration");
        }
    }

    public ZoneId zoneId() {
        return ZoneId.of(timezone);
    }

    public record AvailabilityRule(int dayOfWeek, LocalTime startTime, LocalTime endTime) {
        public AvailabilityRule {
            if (dayOfWeek < 1 || dayOfWeek > 7 || !endTime.isAfter(startTime)) {
                throw new IllegalArgumentException("Invalid availability rule");
            }
        }
    }
}
