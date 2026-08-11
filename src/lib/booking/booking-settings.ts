import type { AvailabilityRule, BookingSettings } from "./booking-types";

export const bookingSettings: BookingSettings = {
  timezone: "Europe/Brussels",
  durationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 15,
  minimumNoticeHours: 24,
  maximumAdvanceDays: 60,
};

export const availabilityRules: AvailabilityRule[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 5, startTime: "09:00", endTime: "15:30" },
];

export const blockedPeriods: Array<{ startsAt: string; endsAt: string }> = [];
