# Guestbook production integration

The `/guestbook` page currently exposes an honest configuration-required state. The repository does not yet contain an authentication library, OAuth adapter, database/ORM, session model, durable rate limiter, or moderation identity system, so posting is intentionally disabled.

Before enabling messages:

1. Select one authentication system and configure GitHub and/or Google OAuth with secure HTTP-only production cookies.
2. Connect one persistent database through a single ORM and add user, account, session, and guestbook-message migrations.
3. Implement `GuestbookService` with ownership checks, visible-message filtering, atomic idempotency, soft moderation status, and durable per-user rate limiting.
4. Store administrator identity only in server configuration and add an audited moderation path.
5. Configure the placeholder environment variables in `.env.example`; never commit their real values.

The typed service boundary lives in `src/lib/guestbook/guestbook-service.ts`. Message normalization and the 2–280 character validation contract live in `src/lib/guestbook/guestbook-validation.ts`.
