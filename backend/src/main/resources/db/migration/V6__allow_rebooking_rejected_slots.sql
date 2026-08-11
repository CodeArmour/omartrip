ALTER TABLE booking_requests DROP CONSTRAINT uq_booking_requests_starts_at;

CREATE UNIQUE INDEX uq_booking_requests_active_starts_at
    ON booking_requests (starts_at)
    WHERE status IN ('PENDING', 'CONFIRMED');
