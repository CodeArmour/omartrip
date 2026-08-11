CREATE TABLE booking_requests (
    id UUID PRIMARY KEY,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    full_name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    topic VARCHAR(300) NOT NULL,
    status VARCHAR(24) NOT NULL,
    idempotency_key VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_booking_requests_starts_at UNIQUE (starts_at),
    CONSTRAINT uq_booking_requests_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT chk_booking_requests_period CHECK (ends_at > starts_at),
    CONSTRAINT chk_booking_requests_status CHECK (
        status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')
    )
);

CREATE INDEX idx_booking_requests_period
    ON booking_requests (starts_at, ends_at);

CREATE INDEX idx_booking_requests_status
    ON booking_requests (status);
