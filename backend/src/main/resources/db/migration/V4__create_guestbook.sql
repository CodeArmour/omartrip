CREATE TABLE guestbook_users (
    id UUID PRIMARY KEY,
    provider VARCHAR(24) NOT NULL,
    provider_id VARCHAR(191) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_guestbook_users_provider_identity UNIQUE (provider, provider_id)
);

CREATE TABLE guestbook_messages (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES guestbook_users (id),
    content VARCHAR(280) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_guestbook_messages_status CHECK (status IN ('VISIBLE', 'HIDDEN', 'PENDING')),
    CONSTRAINT chk_guestbook_messages_content CHECK (char_length(trim(content)) >= 2)
);

CREATE INDEX idx_guestbook_messages_public
    ON guestbook_messages (created_at DESC) WHERE status = 'VISIBLE';

CREATE INDEX idx_guestbook_messages_user_created
    ON guestbook_messages (user_id, created_at DESC);
