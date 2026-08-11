const MIN_MESSAGE_LENGTH = 2;
export const MAX_GUESTBOOK_MESSAGE_LENGTH = 280;

export type GuestbookValidationResult =
  { valid: true; content: string } | { valid: false; error: string };

export function normalizeGuestbookMessage(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim();
}

export function validateGuestbookMessage(
  value: unknown,
): GuestbookValidationResult {
  const content = normalizeGuestbookMessage(value);

  if (content.length < MIN_MESSAGE_LENGTH) {
    return { valid: false, error: "Enter at least 2 characters." };
  }

  if (content.length > MAX_GUESTBOOK_MESSAGE_LENGTH) {
    return { valid: false, error: "Keep your message within 280 characters." };
  }

  return { valid: true, content };
}
