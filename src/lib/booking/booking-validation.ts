import type { CreateBookingInput } from "./booking-types";

function clean(value: unknown, max: number) {
  return typeof value === "string"
    ? value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

export function validateBookingInput(value: unknown) {
  const input = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const normalized: CreateBookingInput = {
    startsAt: clean(input.startsAt, 40),
    fullName: clean(input.fullName, 80),
    email: clean(input.email, 254).toLowerCase(),
    topic: clean(input.topic, 300),
    idempotencyKey: clean(input.idempotencyKey, 80),
    company: clean(input.company, 100),
  };
  const fieldErrors: Record<string, string> = {};

  if (normalized.fullName.length < 2)
    fieldErrors.fullName = "Enter at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email))
    fieldErrors.email = "Enter a valid email address.";
  if (normalized.topic.length < 10)
    fieldErrors.topic = "Add at least 10 characters about the topic.";
  if (normalized.topic.length > 300)
    fieldErrors.topic = "Keep the topic within 300 characters.";
  if (!Number.isFinite(Date.parse(normalized.startsAt)))
    fieldErrors.startsAt = "Select an available time.";
  if (normalized.idempotencyKey.length < 8)
    fieldErrors.idempotencyKey = "Please retry the request.";

  return {
    normalized,
    fieldErrors,
    valid: Object.keys(fieldErrors).length === 0,
  };
}
