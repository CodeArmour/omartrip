ALTER TABLE portfolio_projects
    ADD COLUMN image_public_id VARCHAR(255);

CREATE UNIQUE INDEX uq_portfolio_projects_image_public_id
    ON portfolio_projects (image_public_id)
    WHERE image_public_id IS NOT NULL;
