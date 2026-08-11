"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, Check, Clock3, Mail, MapPin } from "lucide-react";

import type { BookingResult } from "@/lib/booking/booking-types";

export function BookingSuccess({
  result,
}: {
  result: Extract<BookingResult, { status: "pending" }>;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [local, domain] = result.email.split("@");
  const maskedEmail = `${local.slice(0, 2)}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
  }).format(new Date(result.startsAt));

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      className="booking-success"
      aria-labelledby="booking-success-title"
      aria-live="polite"
    >
      <div className="booking-success-header">
        <span className="booking-success-icon" aria-hidden="true">
          <Check />
        </span>
        <div>
          <p className="eyebrow">Request received</p>
          <h2 id="booking-success-title" ref={headingRef} tabIndex={-1}>
            Your call request is in.
          </h2>
          <p className="booking-success-intro">
            Thanks for reaching out. I&apos;ll review your request and send
            confirmation details once the time is approved.
          </p>
        </div>
        <span className="booking-success-status">
          <Clock3 aria-hidden="true" /> Pending review
        </span>
      </div>

      <dl className="booking-success-details">
        <div>
          <CalendarDays aria-hidden="true" />
          <dt>Date and time</dt>
          <dd>{formattedDate}</dd>
        </div>
        <div>
          <MapPin aria-hidden="true" />
          <dt>Timezone</dt>
          <dd>Europe/Brussels</dd>
        </div>
        <div>
          <Clock3 aria-hidden="true" />
          <dt>Session</dt>
          <dd>{result.durationMinutes} minutes</dd>
        </div>
        <div>
          <Mail aria-hidden="true" />
          <dt>Contact</dt>
          <dd>{maskedEmail}</dd>
        </div>
      </dl>

      <div className="booking-success-next-step">
        <Mail aria-hidden="true" />
        <div>
          <strong>What happens next?</strong>
          <p>
            This is a booking request, not a confirmed meeting yet. You&apos;ll
            receive the final meeting details after approval.
          </p>
        </div>
      </div>
    </section>
  );
}
