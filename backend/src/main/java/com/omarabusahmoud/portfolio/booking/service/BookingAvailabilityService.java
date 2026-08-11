package com.omarabusahmoud.portfolio.booking.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import com.omarabusahmoud.portfolio.booking.config.BookingProperties;
import com.omarabusahmoud.portfolio.booking.dto.AvailabilityResponse;
import com.omarabusahmoud.portfolio.booking.dto.AvailableSlot;
import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.model.BookingStatus;
import com.omarabusahmoud.portfolio.booking.repository.BookingRequestRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingAvailabilityService {

    private static final EnumSet<BookingStatus> BLOCKING_STATUSES =
            EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final BookingProperties properties;
    private final BookingRequestRepository repository;
    private final Clock clock;

    public BookingAvailabilityService(
            BookingProperties properties,
            BookingRequestRepository repository,
            Clock clock) {
        this.properties = properties;
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(String monthValue, String dateValue) {
        YearMonth month = parseMonth(monthValue);
        LocalDate requestedDate = dateValue == null ? null : parseDate(dateValue);
        if (requestedDate != null && !YearMonth.from(requestedDate).equals(month)) {
            throw new IllegalArgumentException("Selected date must belong to the requested month");
        }

        List<String> availableDates = month.atDay(1)
                .datesUntil(month.atEndOfMonth().plusDays(1))
                .filter(date -> !generateSlots(date).isEmpty())
                .map(LocalDate::toString)
                .toList();
        List<AvailableSlot> slots = requestedDate == null ? List.of() : generateSlots(requestedDate);
        Instant offsetInstant = slots.isEmpty() ? clock.instant() : slots.getFirst().startsAt();

        return new AvailabilityResponse(
                "live",
                true,
                properties.timezone(),
                offsetLabel(offsetInstant),
                properties.durationMinutes(),
                availableDates,
                slots);
    }

    @Transactional(readOnly = true)
    public List<AvailableSlot> generateSlots(LocalDate date) {
        Instant now = clock.instant();
        LocalDate today = now.atZone(properties.zoneId()).toLocalDate();
        if (date.isBefore(today) || date.isAfter(today.plusDays(properties.maximumAdvanceDays()))) {
            return List.of();
        }

        BookingProperties.AvailabilityRule rule = properties.availabilityRules().stream()
                .filter(item -> item.dayOfWeek() == date.getDayOfWeek().getValue())
                .findFirst()
                .orElse(null);
        if (rule == null) return List.of();

        Instant minimumStart = now.plus(Duration.ofHours(properties.minimumNoticeHours()));
        Instant rangeStart = date.atStartOfDay(properties.zoneId()).toInstant();
        Instant rangeEnd = date.plusDays(1).atStartOfDay(properties.zoneId()).toInstant();
        List<BookingRequestEntity> blocking = repository
                .findAllByStartsAtLessThanAndEndsAtGreaterThanAndStatusIn(
                        rangeEnd, rangeStart, BLOCKING_STATUSES);

        List<AvailableSlot> slots = new ArrayList<>();
        LocalDateTime cursor = date.atTime(rule.startTime())
                .plusMinutes(properties.bufferBeforeMinutes());
        LocalDateTime limit = date.atTime(rule.endTime());
        Duration step = Duration.ofMinutes(
                properties.durationMinutes() + properties.bufferAfterMinutes());

        while (!cursor.plusMinutes(properties.durationMinutes()).isAfter(limit)) {
            Instant startsAt = cursor.atZone(properties.zoneId()).toInstant();
            Instant endsAt = startsAt.plus(Duration.ofMinutes(properties.durationMinutes()));
            boolean overlaps = blocking.stream().anyMatch(item ->
                    startsAt.isBefore(item.getEndsAt()) && endsAt.isAfter(item.getStartsAt()));
            if (startsAt.isAfter(minimumStart) && !overlaps) {
                slots.add(new AvailableSlot(startsAt, endsAt));
            }
            cursor = cursor.plus(step);
        }
        return List.copyOf(slots);
    }

    public boolean isAvailable(Instant requestedStart) {
        LocalDate date = requestedStart.atZone(properties.zoneId()).toLocalDate();
        return generateSlots(date).stream().anyMatch(slot -> slot.startsAt().equals(requestedStart));
    }

    private YearMonth parseMonth(String value) {
        try {
            return YearMonth.parse(value, DateTimeFormatter.ofPattern("uuuu-MM"));
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Month must use YYYY-MM format", exception);
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Date must use YYYY-MM-DD format", exception);
        }
    }

    private String offsetLabel(Instant instant) {
        ZoneOffset offset = properties.zoneId().getRules().getOffset(instant);
        return offset.equals(ZoneOffset.UTC) ? "UTC" : "UTC" + offset;
    }
}
