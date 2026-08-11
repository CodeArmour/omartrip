"use client";

import { useMemo, useRef, useState } from "react";

import type { BookingResult } from "@/lib/booking/booking-types";

type BookingFormProps = {
  selectedDate: string | null;
  selectedSlot: string | null;
  configured: boolean;
  onResult: (result: BookingResult) => void;
};

export function BookingForm({
  selectedDate,
  selectedSlot,
  configured,
  onResult,
}: BookingFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState("");
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const fieldErrors = useMemo(() => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2)
      next.fullName = "Enter at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (topic.trim().length < 10)
      next.topic = "Add at least 10 characters about the topic.";
    if (!selectedDate || !selectedSlot)
      next.startsAt = "Select a date and available time.";
    return next;
  }, [email, fullName, selectedDate, selectedSlot, topic]);
  const valid = Object.keys(fieldErrors).length === 0;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(fieldErrors);
    if (!valid || !selectedSlot || !configured) {
      setServerMessage(
        configured
          ? "Please review the highlighted fields."
          : "Production booking is unavailable until a persistent booking provider and notifications are configured.",
      );
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    setSubmitting(true);
    setServerMessage("");
    try {
      const response = await fetch("/api/booking/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: selectedSlot,
          fullName,
          email,
          topic,
          idempotencyKey: crypto.randomUUID(),
          company: "",
        }),
      });
      const result = (await response.json()) as BookingResult;
      if (!response.ok) {
        if ("fieldErrors" in result && result.fieldErrors)
          setErrors(result.fieldErrors);
        setServerMessage(
          "message" in result
            ? result.message
            : "Booking could not be submitted.",
        );
        requestAnimationFrame(() => errorSummaryRef.current?.focus());
      } else onResult(result);
    } catch {
      setServerMessage(
        "The booking service could not be reached. Please try again later.",
      );
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="booking-form" noValidate onSubmit={submit}>
      <div className="booking-form-heading">
        <div>
          <p className="eyebrow">Your details</p>
          <h2>Request this time</h2>
        </div>
        <p>Requests require review before the meeting is confirmed.</p>
      </div>

      {serverMessage ? (
        <div
          ref={errorSummaryRef}
          className="booking-error-summary"
          role="alert"
          tabIndex={-1}
        >
          <strong>Booking configuration unavailable</strong>
          <p>{serverMessage}</p>
        </div>
      ) : null}

      <div className="booking-form-grid">
        <label>
          <span>Full name</span>
          <input
            name="fullName"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={fullName}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "full-name-error" : undefined}
            onChange={(event) => setFullName(event.target.value)}
            onBlur={() =>
              setErrors((current) => ({
                ...current,
                fullName: fieldErrors.fullName ?? "",
              }))
            }
          />
          {errors.fullName ? (
            <small id="full-name-error">{errors.fullName}</small>
          ) : null}
        </label>
        <label>
          <span>Email address</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "booking-email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() =>
              setErrors((current) => ({
                ...current,
                email: fieldErrors.email ?? "",
              }))
            }
          />
          {errors.email ? (
            <small id="booking-email-error">{errors.email}</small>
          ) : null}
        </label>
        <label className="booking-topic-field">
          <span>Topic</span>
          <textarea
            name="topic"
            required
            minLength={10}
            maxLength={300}
            rows={4}
            placeholder="Tell me briefly what you would like to discuss."
            value={topic}
            aria-invalid={Boolean(errors.topic)}
            aria-describedby="booking-topic-help"
            onChange={(event) => setTopic(event.target.value.slice(0, 300))}
            onBlur={() =>
              setErrors((current) => ({
                ...current,
                topic: fieldErrors.topic ?? "",
              }))
            }
          />
          <span id="booking-topic-help" className="booking-topic-help">
            <small>
              {errors.topic ?? "A short overview helps me prepare."}
            </small>
            <small>
              {Math.max(0, 300 - topic.length)} characters remaining
            </small>
          </span>
        </label>
        <label className="booking-honeypot" aria-hidden="true">
          Company website
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="booking-submit-row">
        {!configured ? (
          <p>Preview mode · requests cannot be submitted yet.</p>
        ) : (
          <span />
        )}
        <button type="submit" disabled={!valid || submitting || !configured}>
          {submitting ? "Sending request…" : "Confirm booking"}
        </button>
      </div>
    </form>
  );
}
