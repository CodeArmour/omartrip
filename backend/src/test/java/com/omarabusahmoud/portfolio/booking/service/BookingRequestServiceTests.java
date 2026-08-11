package com.omarabusahmoud.portfolio.booking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.config.BookingProperties;
import com.omarabusahmoud.portfolio.booking.dto.BookingResult;
import com.omarabusahmoud.portfolio.booking.dto.CreateBookingRequest;
import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.exception.BookingConflictException;
import com.omarabusahmoud.portfolio.booking.repository.BookingRequestRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BookingRequestServiceTests {

    private BookingRequestRepository repository;
    private BookingAvailabilityService availabilityService;
    private BookingRequestService service;
    private BookingProperties properties;

    @BeforeEach
    void setUp() {
        repository = mock(BookingRequestRepository.class);
        availabilityService = mock(BookingAvailabilityService.class);
        properties = new BookingProperties(
                "Europe/Brussels", 30, 0, 15, 24, 60,
                List.of(new BookingProperties.AvailabilityRule(
                        2, LocalTime.of(9, 0), LocalTime.of(17, 0))));
        Clock clock = Clock.fixed(Instant.parse("2026-08-03T00:00:00Z"), ZoneOffset.UTC);
        service = new BookingRequestService(repository, availabilityService, properties, clock);
    }

    @Test
    void createsAPendingBookingWithNormalizedContactData() {
        Instant startsAt = Instant.parse("2026-08-04T07:00:00Z");
        when(repository.findByIdempotencyKey("request-key-123")).thenReturn(Optional.empty());
        when(availabilityService.isAvailable(startsAt)).thenReturn(true);
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResult result = service.create(request(startsAt, "  Omar   Visitor  "));

        assertThat(result.status()).isEqualTo("pending");
        assertThat(result.startsAt()).isEqualTo(startsAt);
        assertThat(result.durationMinutes()).isEqualTo(30);
        assertThat(result.email()).isEqualTo("visitor@example.com");
        verify(repository).saveAndFlush(any(BookingRequestEntity.class));
    }

    @Test
    void returnsTheExistingBookingForAnIdempotentRetry() {
        Instant startsAt = Instant.parse("2026-08-04T07:00:00Z");
        BookingRequestEntity existing = new BookingRequestEntity(
                UUID.randomUUID(), startsAt, startsAt.plusSeconds(1800), "Visitor",
                "visitor@example.com", "A sufficiently long topic", "request-key-123",
                Instant.parse("2026-08-03T00:00:00Z"));
        when(repository.findByIdempotencyKey("request-key-123")).thenReturn(Optional.of(existing));

        BookingResult result = service.create(request(startsAt, "Visitor"));

        assertThat(result.startsAt()).isEqualTo(startsAt);
        verify(availabilityService, never()).isAvailable(any());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsAStaleSlot() {
        Instant startsAt = Instant.parse("2026-08-04T07:00:00Z");
        when(repository.findByIdempotencyKey("request-key-123")).thenReturn(Optional.empty());
        when(availabilityService.isAvailable(startsAt)).thenReturn(false);

        assertThatThrownBy(() -> service.create(request(startsAt, "Visitor")))
                .isInstanceOf(BookingConflictException.class)
                .hasMessageContaining("no longer available");
    }

    private CreateBookingRequest request(Instant startsAt, String name) {
        return new CreateBookingRequest(
                startsAt,
                name,
                "VISITOR@example.com",
                "A sufficiently long project topic",
                "request-key-123",
                "");
    }
}
