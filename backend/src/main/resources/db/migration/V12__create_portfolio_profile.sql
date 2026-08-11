CREATE TABLE portfolio_profile (
    id UUID PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(120) NOT NULL,
    location VARCHAR(160) NOT NULL,
    hero_eyebrow VARCHAR(160) NOT NULL,
    hero_supporting VARCHAR(500) NOT NULL,
    about_bio VARCHAR(1000) NOT NULL,
    services VARCHAR(500) NOT NULL,
    portrait_url VARCHAR(500) NOT NULL,
    portrait_public_id VARCHAR(255),
    open_to_collaboration BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO portfolio_profile (id, full_name, role, location, hero_eyebrow, hero_supporting, about_bio, services, portrait_url, open_to_collaboration, updated_at)
VALUES ('b1000000-0000-4000-8000-000000000001', 'Omar Abusahmoud', 'Software Engineer', 'Brussels, Belgium',
        'Software Developer · Brussels',
        'I build thoughtful web, mobile, cloud and AI solutions that turn ideas into reliable digital products.',
        'I am a software engineer who enjoys turning complex ideas into dependable digital products, from thoughtful interfaces to robust backend systems.',
        'Web development, mobile applications, custom software, cloud/DevOps and AI solutions.',
        '/hero-omar.png', TRUE, CURRENT_TIMESTAMP);
