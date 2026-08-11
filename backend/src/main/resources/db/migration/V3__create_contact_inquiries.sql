CREATE TABLE contact_inquiries (
    id UUID PRIMARY KEY,
    full_name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    status VARCHAR(24) NOT NULL,
    idempotency_key VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_contact_inquiries_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT chk_contact_inquiries_status CHECK (status IN ('NEW', 'READ', 'ARCHIVED'))
);

CREATE INDEX idx_contact_inquiries_created_at ON contact_inquiries (created_at DESC);
CREATE INDEX idx_contact_inquiries_email_created_at ON contact_inquiries (email, created_at DESC);
