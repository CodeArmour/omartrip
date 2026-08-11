CREATE TABLE portfolio_projects (
    id UUID PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    title_line_one VARCHAR(80) NOT NULL,
    title_line_two VARCHAR(80) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description VARCHAR(600) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_alt VARCHAR(240) NOT NULL,
    image_width INTEGER NOT NULL CHECK (image_width > 0),
    image_height INTEGER NOT NULL CHECK (image_height > 0),
    image_position VARCHAR(80) NOT NULL,
    live_url VARCHAR(500),
    repository_url VARCHAR(500),
    tone VARCHAR(16) NOT NULL CHECK (tone IN ('LIME', 'CREAM')),
    customer_name VARCHAR(120) NOT NULL,
    customer_photo VARCHAR(500) NOT NULL,
    customer_photo_alt VARCHAR(240) NOT NULL,
    customer_rating NUMERIC(2,1) NOT NULL CHECK (customer_rating BETWEEN 0 AND 5),
    customer_review VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE portfolio_project_technologies (
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    technology VARCHAR(80) NOT NULL,
    technology_order INTEGER NOT NULL,
    PRIMARY KEY (project_id, technology_order)
);

CREATE INDEX idx_portfolio_projects_public_order
    ON portfolio_projects (published, display_order);

INSERT INTO portfolio_projects (
    id, title, title_line_one, title_line_two, category, description,
    image_path, image_alt, image_width, image_height, image_position,
    live_url, tone, customer_name, customer_photo, customer_photo_alt,
    customer_rating, customer_review, display_order, published, created_at, updated_at
) VALUES
(
    'f8a1f0ab-12bb-4f19-a910-1f30e0fb1001', 'Moon Glow Travel Agent', 'Moon Glow', 'Travel Agent',
    'Travel website', 'An editorial travel experience designed to help visitors discover destinations and begin planning a tailored journey.',
    '/projects/project1.png', 'Moon Glow Travel Agent website showing curated destinations in Egypt, Saudi Arabia, Qatar and Dubai',
    1393, 967, 'center top', 'https://moon-two-flame.vercel.app/', 'LIME', 'Moon Glow Team',
    '/projects/project1.png', 'Moon Glow Travel Agent brand preview', 5.0,
    'Omar translated our travel concept into a clear, polished experience that feels inviting and makes destinations easy to explore.',
    0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'f8a1f0ab-12bb-4f19-a910-1f30e0fb1002', 'Andalucia Engineering Consulting', 'Andalucia Engineering', 'Consulting',
    'Corporate website', 'A confident corporate presence that organizes consultancy services, industries and project expertise into a clear digital introduction.',
    '/projects/project2.png', 'Andalucia Engineering Consulting website with engineering consultancy introduction',
    1730, 942, 'center top', 'https://www.andaluciagroup.eu/', 'CREAM', 'Andalucia Group',
    '/projects/project2.png', 'Andalucia Engineering Consulting brand preview', 5.0,
    'The new website presents our engineering services with confidence and gives visitors a much clearer path through our expertise.',
    1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO portfolio_project_technologies (project_id, technology, technology_order) VALUES
('f8a1f0ab-12bb-4f19-a910-1f30e0fb1001', 'Next.js', 0),
('f8a1f0ab-12bb-4f19-a910-1f30e0fb1001', 'TypeScript', 1),
('f8a1f0ab-12bb-4f19-a910-1f30e0fb1001', 'Tailwind CSS', 2),
('f8a1f0ab-12bb-4f19-a910-1f30e0fb1002', 'Next.js', 0),
('f8a1f0ab-12bb-4f19-a910-1f30e0fb1002', 'TypeScript', 1),
('f8a1f0ab-12bb-4f19-a910-1f30e0fb1002', 'Tailwind CSS', 2);
