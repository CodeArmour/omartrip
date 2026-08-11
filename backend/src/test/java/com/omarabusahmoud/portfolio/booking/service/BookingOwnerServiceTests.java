package com.omarabusahmoud.portfolio.booking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.model.BookingStatus;
import com.omarabusahmoud.portfolio.booking.repository.BookingRequestRepository;
import org.junit.jupiter.api.Test;

class BookingOwnerServiceTests {

    @Test
    void listsPendingRequestsAndConfirmsASelection() {
        BookingRequestRepository repository = mock(BookingRequestRepository.class);
        Instant now = Instant.parse("2026-08-10T10:00:00Z");
        BookingRequestEntity booking = booking(now);
        when(repository.findAllByStatusOrderByStartsAtAsc(BookingStatus.PENDING)).thenReturn(List.of(booking));
        when(repository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(repository.saveAndFlush(booking)).thenReturn(booking);
        BookingOwnerService service = new BookingOwnerService(
                repository, Clock.fixed(now, ZoneOffset.UTC));

        assertThat(service.list(BookingStatus.PENDING)).singleElement()
                .satisfies(item -> assertThat(item.email()).isEqualTo("visitor@example.com"));

        var updated = service.updateStatus(booking.getId(), BookingStatus.CONFIRMED);

        assertThat(updated.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(updated.updatedAt()).isEqualTo(now);
    }

    private BookingRequestEntity booking(Instant now) {
        Instant start = now.plusSeconds(86_400);
        return new BookingRequestEntity(
                UUID.randomUUID(), start, start.plusSeconds(1800), "Example Visitor",
                "visitor@example.com", "Discuss a portfolio project", "owner-test-key", now.minusSeconds(60));
    }
}
