import {
  addDays,
  dateKeyInTimezone,
  getTimezoneOffsetLabel,
  zonedDateTimeToUtc,
} from "./calendar-utils";
import {
  availabilityRules,
  blockedPeriods,
  bookingSettings,
} from "./booking-settings";
import type { AvailableSlot, AvailabilityResponse } from "./booking-types";

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function timeFromMinutes(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function dayOfWeek(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function overlapsBlocked(startsAt: Date, endsAt: Date) {
  return blockedPeriods.some(
    (period) =>
      startsAt < new Date(period.endsAt) && endsAt > new Date(period.startsAt),
  );
}

export function generateSlotsForDate(dateKey: string, now = new Date()) {
  const rule = availabilityRules.find(
    (item) => item.dayOfWeek === dayOfWeek(dateKey),
  );
  if (!rule) return [];

  const today = dateKeyInTimezone(now, bookingSettings.timezone);
  const lastDate = addDays(today, bookingSettings.maximumAdvanceDays);
  if (dateKey < today || dateKey > lastDate) return [];

  const minimumStart = new Date(
    now.getTime() + bookingSettings.minimumNoticeHours * 60 * 60 * 1000,
  );
  const slots: AvailableSlot[] = [];
  const step =
    bookingSettings.durationMinutes + bookingSettings.bufferAfterMinutes;

  for (
    let cursor = minutes(rule.startTime) + bookingSettings.bufferBeforeMinutes;
    cursor + bookingSettings.durationMinutes <= minutes(rule.endTime);
    cursor += step
  ) {
    const startsAt = zonedDateTimeToUtc(
      dateKey,
      timeFromMinutes(cursor),
      bookingSettings.timezone,
    );
    const endsAt = new Date(
      startsAt.getTime() + bookingSettings.durationMinutes * 60 * 1000,
    );
    if (startsAt <= minimumStart || overlapsBlocked(startsAt, endsAt)) continue;
    slots.push({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
  }
  return slots;
}

export function getPreviewAvailability(input: {
  month: string;
  date?: string;
  now?: Date;
}): AvailabilityResponse {
  const now = input.now ?? new Date();
  const [year, month] = input.month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const availableDates = Array.from(
    { length: daysInMonth },
    (_, index) =>
      `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
  ).filter((date) => generateSlotsForDate(date, now).length > 0);
  const slots = input.date ? generateSlotsForDate(input.date, now) : [];

  return {
    mode: "preview",
    configured: false,
    timezone: bookingSettings.timezone,
    utcOffset: getTimezoneOffsetLabel(
      input.date && slots[0] ? new Date(slots[0].startsAt) : now,
      bookingSettings.timezone,
    ),
    durationMinutes: bookingSettings.durationMinutes,
    availableDates,
    slots,
    message:
      "Preview availability only. Live calendar, reservation and notification providers are not configured.",
  };
}
