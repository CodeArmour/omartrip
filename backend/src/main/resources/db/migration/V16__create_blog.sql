CREATE TABLE blog_posts (
    id UUID PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(180) NOT NULL,
    excerpt VARCHAR(360) NOT NULL,
    image_url VARCHAR(700),
    image_alt VARCHAR(220),
    content TEXT NOT NULL,
    attachment_label VARCHAR(160),
    attachment_url VARCHAR(700),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_blog_posts_public_order
    ON blog_posts (published, published_at DESC, created_at DESC);

CREATE TABLE blog_comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES guestbook_users(id) ON DELETE CASCADE,
    content VARCHAR(1000) NOT NULL,
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_blog_comments_post_visible_order
    ON blog_comments (post_id, hidden, created_at DESC);

CREATE TABLE blog_post_likes (
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES guestbook_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE blog_comment_likes (
    comment_id UUID NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES guestbook_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (comment_id, user_id)
);
