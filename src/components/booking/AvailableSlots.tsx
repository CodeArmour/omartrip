"use client";

import { Check } from "lucide-react";

import { formatSlotTime } from "@/lib/booking/calendar-utils";
import type { AvailableSlot } from "@/lib/booking/booking-types";

type AvailableSlotsProps = {
  selectedDate: string | null;
  slots: AvailableSlot[];
  selectedSlot: string | null;
  loading: boolean;
  hour12: boolean;
  utcOffset: string;
  onFormatChange: (hour12: boolean) => void;
  onSelectSlot: (slot: string) => void;
};

export function AvailableSlots({
  selectedDate,
  slots,
  selectedSlot,
  loading,
  hour12,
  utcOffset,
  onFormatChange,
  onSelectSlot,
}: AvailableSlotsProps) {
  return (
    <section
      className="booking-slots-column"
      aria-labelledby="booking-slots-title"
    >
      <div className="booking-slots-heading">
        <div>
          <h2 id="booking-slots-title">Available Slots</h2>
          <p>Times shown in Europe/Brussels</p>
          <small>{utcOffset}</small>
        </div>
        <fieldset className="time-format-toggle">
          <legend className="sr-only">Time format</legend>
          <button
            type="button"
            aria-pressed={!hour12}
            onClick={() => onFormatChange(false)}
          >
            24h
          </button>
          <button
            type="button"
            aria-pressed={hour12}
            onClick={() => onFormatChange(true)}
          >
            12h
          </button>
        </fieldset>
      </div>

      <div
        className="booking-slots-list"
        aria-live="polite"
        aria-busy={loading}
      >
        {loading ? (
          <div className="booking-state-message">Resolving availability…</div>
        ) : !selectedDate ? (
          <div className="booking-state-message">
            Select an available date to see times.
          </div>
        ) : slots.length === 0 ? (
          <div className="booking-state-message">
            No available times on this date. Please choose another day.
          </div>
        ) : (
          slots.map((slot) => {
            const selected = selectedSlot === slot.startsAt;
            return (
              <button
                key={slot.startsAt}
                type="button"
                data-starts-at={slot.startsAt}
                aria-pressed={selected}
                className={selected ? "is-selected" : undefined}
                onClick={() => onSelectSlot(slot.startsAt)}
              >
                <span>{formatSlotTime(slot.startsAt, hour12)}</span>
                {selected ? <Check aria-hidden="true" /> : null}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
