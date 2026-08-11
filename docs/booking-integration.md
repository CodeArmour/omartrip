# Booking integration

The `/book` UI currently uses server-generated preview availability. It does not reserve slots, create meetings, persist personal data, or send notifications.

Production booking requires a `BookingService` adapter with:

- persistent storage with a unique constraint on the slot start timestamp;
- an atomic transaction or provider reservation during `createBooking`;
- provider-level availability and blocked-period synchronization;
- email notification delivery for pending requests and later confirmation;
- infrastructure-backed rate limiting;
- idempotency-key persistence.

Configure only server-side environment variables documented in `.env.example`. Never expose provider credentials through `NEXT_PUBLIC_*` variables.
