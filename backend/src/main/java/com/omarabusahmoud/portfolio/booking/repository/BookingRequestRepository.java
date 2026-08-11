package com.omarabusahmoud.portfolio.booking.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.model.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRequestRepository extends JpaRepository<BookingRequestEntity, UUID> {

    Optional<BookingRequestEntity> findByIdempotencyKey(String idempotencyKey);

    List<BookingRequestEntity> findAllByStartsAtLessThanAndEndsAtGreaterThanAndStatusIn(
            Instant rangeEnd,
            Instant rangeStart,
            Collection<BookingStatus> statuses);

    List<BookingRequestEntity> findAllByStatusOrderByStartsAtAsc(BookingStatus status);
}
