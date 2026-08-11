CREATE TABLE workspace_google_connection (
    id UUID PRIMARY KEY,
    account_email VARCHAR(255) NOT NULL,
    encrypted_refresh_token TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX uq_workspace_google_connection_email ON workspace_google_connection (LOWER(account_email));
