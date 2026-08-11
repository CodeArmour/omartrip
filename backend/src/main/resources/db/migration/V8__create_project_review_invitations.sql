CREATE TABLE project_review_invitations (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_project_review_invitations_project
    ON project_review_invitations (project_id, created_at DESC);
