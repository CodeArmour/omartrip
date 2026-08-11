"use client";

import { useEffect, useMemo, useState } from "react";

import { dateKeyInTimezone } from "@/lib/booking/calendar-utils";
import type {
  AvailabilityResponse,
  BookingResult,
} from "@/lib/booking/booking-types";

import { AvailableSlots } from "./AvailableSlots";
import { BookingCalendar } from "./BookingCalendar";
import { BookingForm } from "./BookingForm";
import { BookingSuccess } from "./BookingSuccess";
import { MeetingDetails } from "./MeetingDetails";
import { OwnerBookingPanel } from "./OwnerBookingPanel";

const timezone = "Europe/Brussels";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function BookingScheduler() {
  const today = dateKeyInTimezone(new Date(), timezone);
  const initialMonth = useMemo(() => {
    const [year, month] = today.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [today]);
  const [month, setMonth] = useState(initialMonth);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [monthLoading, setMonthLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [hour12, setHour12] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("omar-booking-hour12");
    if (saved === "true") queueMicrotask(() => setHour12(true));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/booking/availability?month=${monthKey(month)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: AvailabilityResponse) => setAvailability(data))
      .catch((error) => {
        if (error.name !== "AbortError") setAvailability(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setMonthLoading(false);
      });
    return () => controller.abort();
  }, [month]);

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotLoading(true);
    fetch(`/api/booking/availability?month=${monthKey(month)}&date=${date}`)
      .then((response) => response.json())
      .then((data: AvailabilityResponse) => setAvailability(data))
      .finally(() => setSlotLoading(false));
  };

  const maxMonth = new Date(
    initialMonth.getFullYear(),
    initialMonth.getMonth() + 2,
    1,
  );
  const availableDates = new Set(availability?.availableDates ?? []);

  return (
    <>
      <OwnerBookingPanel status="PENDING" />
      <section
        id="booking-scheduler"
        className="booking-scheduler"
        aria-labelledby="booking-interface-title"
        tabIndex={-1}
      >
        <h2 id="booking-interface-title" className="sr-only">
          Choose a date and time
        </h2>
        {availability?.mode === "preview" ? (
          <div className="booking-preview-banner" role="status">
            <strong>Development preview</strong>
            <span>{availability.message}</span>
          </div>
        ) : null}

        {result?.status === "pending" ? (
          <BookingSuccess result={result} />
        ) : (
          <>
            <div className="booking-scheduler-columns">
              <MeetingDetails />
              <BookingCalendar
                month={month}
                today={today}
                selectedDate={selectedDate}
                availableDates={availableDates}
                loading={monthLoading}
                canGoPrevious={month > initialMonth}
                canGoNext={month < maxMonth}
                onChangeMonth={(offset) => {
                  setMonthLoading(true);
                  setMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() + offset,
                        1,
                      ),
                  );
                  setSelectedDate(null);
                  setSelectedSlot(null);
                }}
                onSelectDate={selectDate}
              />
              <AvailableSlots
                selectedDate={selectedDate}
                slots={availability?.slots ?? []}
                selectedSlot={selectedSlot}
                loading={slotLoading}
                hour12={hour12}
                utcOffset={availability?.utcOffset ?? "UTC"}
                onFormatChange={(value) => {
                  setHour12(value);
                  window.localStorage.setItem(
                    "omar-booking-hour12",
                    String(value),
                  );
                }}
                onSelectSlot={setSelectedSlot}
              />
            </div>
            <BookingForm
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              configured={availability?.configured ?? false}
              onResult={setResult}
            />
          </>
        )}
      </section>
      <OwnerBookingPanel status="CONFIRMED" />
    </>
  );
}
