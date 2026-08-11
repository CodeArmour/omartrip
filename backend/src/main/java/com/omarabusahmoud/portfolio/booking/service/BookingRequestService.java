package com.omarabusahmoud.portfolio.booking.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.config.BookingProperties;
import com.omarabusahmoud.portfolio.booking.dto.BookingResult;
import com.omarabusahmoud.portfolio.booking.dto.CreateBookingRequest;
import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.exception.BookingConflictException;
import com.omarabusahmoud.portfolio.booking.repository.BookingRequestRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingRequestService {

    private final BookingRequestRepository repository;
    private final BookingAvailabilityService availabilityService;
    private final BookingProperties properties;
    private final Clock clock;

    public BookingRequestService(
            BookingRequestRepository repository,
            BookingAvailabilityService availabilityService,
            BookingProperties properties,
            Clock clock) {
        this.repository = repository;
        this.availabilityService = availabilityService;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public BookingResult create(CreateBookingRequest request) {
        if (request.company() != null && !request.company().isBlank()) {
            throw new IllegalArgumentException("Request could not be processed");
        }

        String idempotencyKey = normalize(request.idempotencyKey());
        BookingRequestEntity existing = repository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) return BookingResult.pending(existing, properties.durationMinutes());
        if (!availabilityService.isAvailable(request.startsAt())) throw new BookingConflictException();

        Instant createdAt = clock.instant();
        BookingRequestEntity booking = new BookingRequestEntity(
                UUID.randomUUID(),
                request.startsAt(),
                request.startsAt().plus(Duration.ofMinutes(properties.durationMinutes())),
                normalize(request.fullName()),
                normalize(request.email()).toLowerCase(Locale.ROOT),
                normalize(request.topic()),
                idempotencyKey,
                createdAt);
        try {
            return BookingResult.pending(repository.saveAndFlush(booking), properties.durationMinutes());
        } catch (DataIntegrityViolationException exception) {
            throw new BookingConflictException();
        }
    }

    private String normalize(String value) {
        return value.trim().replaceAll("\\s+", " ");
    }
}
