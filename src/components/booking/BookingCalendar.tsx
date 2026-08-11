"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { addDays, getMonthGrid } from "@/lib/booking/calendar-utils";

type BookingCalendarProps = {
  month: Date;
  today: string;
  selectedDate: string | null;
  availableDates: Set<string>;
  loading: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onChangeMonth: (offset: number) => void;
  onSelectDate: (date: string) => void;
};

export function BookingCalendar({
  month,
  today,
  selectedDate,
  availableDates,
  loading,
  canGoPrevious,
  canGoNext,
  onChangeMonth,
  onSelectDate,
}: BookingCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const grid = useMemo(
    () => getMonthGrid(year, monthIndex),
    [monthIndex, year],
  );
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(month);
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
      new Date(Date.UTC(2024, 0, index + 1)),
    ),
  );

  const moveFocus = (date: string, amount: number) => {
    const target = addDays(date, amount);
    const [targetYear, targetMonth] = target.split("-").map(Number);
    if (targetYear !== year || targetMonth !== monthIndex + 1) {
      onChangeMonth(amount > 0 ? 1 : -1);
    }
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(`[data-booking-date='${target}']`)
        ?.focus();
    });
  };

  return (
    <section
      className="booking-calendar-column"
      aria-labelledby="booking-calendar-title"
    >
      <div className="booking-calendar-header">
        <h2 id="booking-calendar-title" aria-live="polite">
          {monthLabel}
        </h2>
        <div>
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoPrevious}
            onClick={() => onChangeMonth(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={!canGoNext}
            onClick={() => onChangeMonth(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="booking-weekdays" aria-hidden="true">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div
        className={`booking-calendar-grid${loading ? " is-loading" : ""}`}
        role="grid"
        aria-busy={loading}
      >
        {grid.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const isAvailable = availableDates.has(date);
          const label = new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${date}T12:00:00Z`));

          return (
            <button
              key={date}
              type="button"
              role="gridcell"
              data-booking-date={date}
              disabled={!isAvailable}
              aria-label={`${isAvailable ? "Select" : "Unavailable"} ${label}`}
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              className={`${isToday ? "is-today" : ""}${isSelected ? " is-selected" : ""}`}
              onClick={() => onSelectDate(date)}
              onKeyDown={(event) => {
                const offsets: Record<string, number> = {
                  ArrowLeft: -1,
                  ArrowRight: 1,
                  ArrowUp: -7,
                  ArrowDown: 7,
                };
                if (event.key in offsets) {
                  event.preventDefault();
                  moveFocus(date, offsets[event.key]);
                } else if (event.key === "Home" || event.key === "End") {
                  event.preventDefault();
                  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
                  const mondayIndex = (weekday + 6) % 7;
                  moveFocus(
                    date,
                    event.key === "Home" ? -mondayIndex : 6 - mondayIndex,
                  );
                } else if (event.key === "PageUp" || event.key === "PageDown") {
                  event.preventDefault();
                  onChangeMonth(event.key === "PageUp" ? -1 : 1);
                }
              }}
            >
              <span>{Number(date.slice(-2))}</span>
              {isSelected ? <small>Selected</small> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
