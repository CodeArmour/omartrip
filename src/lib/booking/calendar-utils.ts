const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timezone: string) {
  let formatter = partsFormatterCache.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    partsFormatterCache.set(timezone, formatter);
  }
  return formatter;
}

export function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return formatDateKey(new Date(Date.UTC(year, month - 1, day + amount)));
}

export function getDatePartsInTimezone(date: Date, timezone: string) {
  const parts = Object.fromEntries(
    getPartsFormatter(timezone)
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );
  return parts as Record<
    "year" | "month" | "day" | "hour" | "minute" | "second",
    number
  >;
}

export function dateKeyInTimezone(date: Date, timezone: string) {
  const { year, month, day } = getDatePartsInTimezone(date, timezone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function zonedDateTimeToUtc(
  dateKey: string,
  time: string,
  timezone: string,
) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = desiredUtc;

  for (let index = 0; index < 3; index += 1) {
    const parts = getDatePartsInTimezone(new Date(candidate), timezone);
    const representedUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    candidate += desiredUtc - representedUtc;
  }

  return new Date(candidate);
}

export function getTimezoneOffsetLabel(date: Date, timezone: string) {
  const part = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(date)
    .find(({ type }) => type === "timeZoneName")?.value;
  return part?.replace("GMT", "UTC") ?? "UTC";
}

export function getMonthGrid(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - mondayOffset + 1;
    return day >= 1 && day <= daysInMonth
      ? formatDateKey(new Date(Date.UTC(year, monthIndex, day)))
      : null;
  });
}

export function formatSlotTime(
  iso: string,
  hour12: boolean,
  timezone = "Europe/Brussels",
) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12,
  }).format(new Date(iso));
}
