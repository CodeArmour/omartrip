INSERT INTO guestbook_users (
    id,
    provider,
    provider_id,
    display_name,
    avatar_url,
    created_at,
    updated_at
)
SELECT
    '11111111-1111-4111-8111-111111111111',
    'demo',
    'blog-demo-maya',
    'Maya Chen',
    NULL,
    TIMESTAMPTZ '2026-08-10 10:00:00+02',
    TIMESTAMPTZ '2026-08-10 10:00:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM guestbook_users WHERE id = '11111111-1111-4111-8111-111111111111'
);

INSERT INTO guestbook_users (
    id,
    provider,
    provider_id,
    display_name,
    avatar_url,
    created_at,
    updated_at
)
SELECT
    '22222222-2222-4222-8222-222222222222',
    'demo',
    'blog-demo-jonas',
    'Jonas Vermeulen',
    NULL,
    TIMESTAMPTZ '2026-08-10 10:05:00+02',
    TIMESTAMPTZ '2026-08-10 10:05:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM guestbook_users WHERE id = '22222222-2222-4222-8222-222222222222'
);

INSERT INTO blog_posts (
    id,
    slug,
    title,
    excerpt,
    image_url,
    image_alt,
    content,
    attachment_label,
    attachment_url,
    published,
    created_at,
    updated_at,
    published_at
)
SELECT
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'building-portfolio-systems-that-feel-alive',
    'Building Portfolio Systems That Feel Alive',
    'How a developer portfolio can behave like a useful product instead of a static resume.',
    '/projects/project1.png',
    'Project interface screenshot used as a visual example for portfolio systems',
    '## Start with the visitor journey

A strong portfolio works better when it behaves like a small product, not a static resume. The goal is to help visitors understand who you are, what you build, and what they should do next.

- Show identity fast
- Present work with clear context
- Make contact and booking actions easy to find
- Keep motion polished, not distracting

## Design for trust

Visitors should feel that every section has a purpose. The hero introduces the person, projects prove capability, and interactive details make the experience memorable.

```ts
type PortfolioSignal = {
  story: string;
  proof: string[];
  nextAction: "read" | "contact" | "book";
};
```

## Final note

The best portfolio is not the loudest one. It is the one that makes a visitor feel oriented, confident, and ready to start a conversation.',
    'Portfolio planning checklist',
    NULL,
    TRUE,
    TIMESTAMPTZ '2026-08-10 11:00:00+02',
    TIMESTAMPTZ '2026-08-10 11:00:00+02',
    TIMESTAMPTZ '2026-08-10 11:00:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_posts WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
);

INSERT INTO blog_posts (
    id,
    slug,
    title,
    excerpt,
    image_url,
    image_alt,
    content,
    attachment_label,
    attachment_url,
    published,
    created_at,
    updated_at,
    published_at
)
SELECT
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'designing-backend-apis-for-real-portfolio-features',
    'Designing Backend APIs for Real Portfolio Features',
    'A practical look at turning portfolio interactions into secure, maintainable backend features.',
    '/projects/project2.png',
    'Project website screenshot used as a visual example for backend-backed portfolio features',
    '## Make the API match the product

Portfolio features become more useful when the backend supports real workflows: booking requests, guestbook moderation, project reviews, owner controls, and assistant knowledge.

## Keep the boundaries clear

The frontend should handle interaction quality. The backend should handle validation, ownership, persistence, rate limits, and external integrations.

1. Validate every request on the server
2. Store only the data the product needs
3. Keep integrations behind service interfaces
4. Return clear errors the UI can display

```java
public interface BookingService {
    AvailabilityResponse getAvailability(AvailabilityRequest request);
    BookingResult createBooking(CreateBookingRequest request);
}
```

## Production mindset

Good APIs do not only make the happy path work. They also protect data, handle conflicts, and make future changes easier.',
    'Backend API notes',
    NULL,
    TRUE,
    TIMESTAMPTZ '2026-08-10 12:00:00+02',
    TIMESTAMPTZ '2026-08-10 12:00:00+02',
    TIMESTAMPTZ '2026-08-10 12:00:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_posts WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
);

INSERT INTO blog_comments (
    id,
    post_id,
    user_id,
    content,
    hidden,
    created_at,
    updated_at
)
SELECT
    '33333333-3333-4333-8333-333333333333',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'This makes the portfolio feel more useful than a normal landing page. The product-thinking angle is clear.',
    FALSE,
    TIMESTAMPTZ '2026-08-10 12:30:00+02',
    TIMESTAMPTZ '2026-08-10 12:30:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_comments WHERE id = '33333333-3333-4333-8333-333333333333'
);

INSERT INTO blog_comments (
    id,
    post_id,
    user_id,
    content,
    hidden,
    created_at,
    updated_at
)
SELECT
    '44444444-4444-4444-8444-444444444444',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '22222222-2222-4222-8222-222222222222',
    'I like the idea of making each section answer a real visitor question instead of only showing visuals.',
    FALSE,
    TIMESTAMPTZ '2026-08-10 12:45:00+02',
    TIMESTAMPTZ '2026-08-10 12:45:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_comments WHERE id = '44444444-4444-4444-8444-444444444444'
);

INSERT INTO blog_comments (
    id,
    post_id,
    user_id,
    content,
    hidden,
    created_at,
    updated_at
)
SELECT
    '55555555-5555-4555-8555-555555555555',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '11111111-1111-4111-8111-111111111111',
    'The separation between UI behavior and backend responsibility is a good pattern. It makes the project easier to extend.',
    FALSE,
    TIMESTAMPTZ '2026-08-10 13:10:00+02',
    TIMESTAMPTZ '2026-08-10 13:10:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_comments WHERE id = '55555555-5555-4555-8555-555555555555'
);

INSERT INTO blog_comments (
    id,
    post_id,
    user_id,
    content,
    hidden,
    created_at,
    updated_at
)
SELECT
    '66666666-6666-4666-8666-666666666666',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Useful breakdown. The API examples make the article feel practical without becoming too heavy.',
    FALSE,
    TIMESTAMPTZ '2026-08-10 13:25:00+02',
    TIMESTAMPTZ '2026-08-10 13:25:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_comments WHERE id = '66666666-6666-4666-8666-666666666666'
);

INSERT INTO blog_post_likes (post_id, user_id, created_at)
SELECT
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    TIMESTAMPTZ '2026-08-10 14:00:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_post_likes
    WHERE post_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      AND user_id = '11111111-1111-4111-8111-111111111111'
);

INSERT INTO blog_post_likes (post_id, user_id, created_at)
SELECT
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '22222222-2222-4222-8222-222222222222',
    TIMESTAMPTZ '2026-08-10 14:05:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_post_likes
    WHERE post_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      AND user_id = '22222222-2222-4222-8222-222222222222'
);

INSERT INTO blog_post_likes (post_id, user_id, created_at)
SELECT
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '11111111-1111-4111-8111-111111111111',
    TIMESTAMPTZ '2026-08-10 14:10:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_post_likes
    WHERE post_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      AND user_id = '11111111-1111-4111-8111-111111111111'
);

INSERT INTO blog_comment_likes (comment_id, user_id, created_at)
SELECT
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    TIMESTAMPTZ '2026-08-10 14:20:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_comment_likes
    WHERE comment_id = '33333333-3333-4333-8333-333333333333'
      AND user_id = '22222222-2222-4222-8222-222222222222'
);

INSERT INTO blog_comment_likes (comment_id, user_id, created_at)
SELECT
    '55555555-5555-4555-8555-555555555555',
    '22222222-2222-4222-8222-222222222222',
    TIMESTAMPTZ '2026-08-10 14:25:00+02'
WHERE NOT EXISTS (
    SELECT 1 FROM blog_comment_likes
    WHERE comment_id = '55555555-5555-4555-8555-555555555555'
      AND user_id = '22222222-2222-4222-8222-222222222222'
);
