package com.omarabusahmoud.portfolio.booking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.config.BookingProperties;
import com.omarabusahmoud.portfolio.booking.dto.AvailableSlot;
import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.repository.BookingRequestRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BookingAvailabilityServiceTests {

    private BookingRequestRepository repository;
    private BookingAvailabilityService service;

    @BeforeEach
    void setUp() {
        repository = mock(BookingRequestRepository.class);
        when(repository.findAllByStartsAtLessThanAndEndsAtGreaterThanAndStatusIn(
                any(), any(), anyCollection())).thenReturn(List.of());
        BookingProperties properties = new BookingProperties(
                "Europe/Brussels",
                30,
                0,
                15,
                24,
                60,
                List.of(
                        new BookingProperties.AvailabilityRule(1, LocalTime.of(9, 0), LocalTime.of(17, 0)),
                        new BookingProperties.AvailabilityRule(2, LocalTime.of(9, 0), LocalTime.of(17, 0))));
        Clock clock = Clock.fixed(Instant.parse("2026-08-03T00:00:00Z"), ZoneOffset.UTC);
        service = new BookingAvailabilityService(properties, repository, clock);
    }

    @Test
    void generatesBrusselsSlotsWithMinimumNoticeAndSummerOffset() {
        List<AvailableSlot> slots = service.generateSlots(LocalDate.parse("2026-08-04"));

        assertThat(slots).isNotEmpty();
        assertThat(slots.getFirst().startsAt()).isEqualTo(Instant.parse("2026-08-04T07:00:00Z"));
        assertThat(slots.getFirst().endsAt()).isEqualTo(Instant.parse("2026-08-04T07:30:00Z"));
        assertThat(service.getAvailability("2026-08", "2026-08-04").utcOffset())
                .isEqualTo("UTC+02:00");
    }

    @Test
    void removesAnOverlappingPendingBooking() {
        BookingRequestEntity existing = new BookingRequestEntity(
                UUID.randomUUID(),
                Instant.parse("2026-08-04T07:00:00Z"),
                Instant.parse("2026-08-04T07:30:00Z"),
                "Visitor",
                "visitor@example.com",
                "A sufficiently long topic",
                "existing-key",
                Instant.parse("2026-08-01T00:00:00Z"));
        when(repository.findAllByStartsAtLessThanAndEndsAtGreaterThanAndStatusIn(
                any(), any(), anyCollection())).thenReturn(List.of(existing));

        List<AvailableSlot> slots = service.generateSlots(LocalDate.parse("2026-08-04"));

        assertThat(slots).noneMatch(slot -> slot.startsAt().equals(existing.getStartsAt()));
    }

    @Test
    void rejectsDatesOutsideTheBookingWindow() {
        assertThat(service.generateSlots(LocalDate.parse("2026-08-02"))).isEmpty();
        assertThat(service.generateSlots(LocalDate.parse("2026-10-05"))).isEmpty();
    }
}
