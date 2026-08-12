"use client";

import {
  CalendarCheck2,
  Check,
  Clock3,
  LoaderCircle,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  portfolioApiUrl,
  usePortfolioAuth,
} from "@/components/auth/PortfolioAuthProvider";
import { Skeleton } from "@/components/ui/Skeleton";

type OwnerBooking = {
  id: string;
  startsAt: string;
  endsAt: string;
  fullName: string;
  email: string;
  topic: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  calendarEventId?: string;
  googleMeetUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type OwnerBookingPanelProps = {
  status: "PENDING" | "CONFIRMED";
};

const bookingsChangedEvent = "portfolio:bookings-changed";

export function OwnerBookingPanel({ status }: OwnerBookingPanelProps) {
  const { session, csrfHeaders } = usePortfolioAuth();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [workspaceConnected, setWorkspaceConnected] = useState(false);
  const [workspaceConfigured, setWorkspaceConfigured] = useState(false);
  const isPending = status === "PENDING";

  const load = useCallback(async () => {
    if (!session.admin) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/bookings/admin/requests?status=${status}`,
        { credentials: "include" },
      );
      if (!response.ok) throw new Error("Bookings could not be loaded.");
      setBookings((await response.json()) as OwnerBooking[]);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Bookings could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session.admin, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const refresh = () => void load();
    window.addEventListener(bookingsChangedEvent, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(bookingsChangedEvent, refresh);
    };
  }, [load]);

  useEffect(() => {
    if (!session.admin || !isPending) return;
    const check = async () => {
      try {
        const response = await fetch(
          `${portfolioApiUrl}/api/v1/workspace/google/status`,
          { credentials: "include" },
        );
        if (!response.ok) return;
        const status = (await response.json()) as {
          configured: boolean;
          connected: boolean;
        };
        setWorkspaceConfigured(status.configured);
        setWorkspaceConnected(status.connected);
      } catch {
        /* status is non-critical to booking list rendering */
      }
    };
    void check();
  }, [isPending, session.admin]);

  async function review(id: string, action: "confirm" | "reject" | "cancel") {
    setActingOn(id);
    setError("");
    try {
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/bookings/admin/requests/${id}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: await csrfHeaders(),
        },
      );
      if (!response.ok) throw new Error("The booking could not be updated.");
      setBookings((current) => current.filter((booking) => booking.id !== id));
      window.dispatchEvent(new Event(bookingsChangedEvent));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The booking could not be updated.",
      );
    } finally {
      setActingOn(null);
    }
  }

  if (!session.admin) return null;

  const sectionId = isPending ? "owner-bookings" : "owner-confirmed-bookings";

  return (
    <section
      id={sectionId}
      className={`owner-bookings owner-bookings-${status.toLowerCase()}`}
      aria-labelledby={`${sectionId}-title`}
      data-scroll-reveal
    >
      <header className="owner-bookings-header">
        <div>
          <span>
            {isPending ? (
              <ShieldCheck aria-hidden="true" />
            ) : (
              <CalendarCheck2 aria-hidden="true" />
            )}
            {isPending ? "Owner review" : "Upcoming schedule"}
          </span>
          <h2 id={`${sectionId}-title`}>
            {isPending ? "Pending booking requests" : "Confirmed calls"}
          </h2>
        </div>
        <strong className="owner-bookings-count">
          {bookings.length} {isPending ? "awaiting review" : "confirmed"}
        </strong>
      </header>

      {isPending && session.admin && workspaceConfigured ? (
        <div className="owner-workspace-connection">
          <span>
            {workspaceConnected
              ? "Google Calendar connected"
              : "Connect Google Calendar to create Meet links and send confirmations."}
          </span>
          {!workspaceConnected ? (
            <button
              type="button"
              onClick={() => {
                // OAuth starts on the Spring backend and intentionally leaves the Next.js origin.
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.href = `${portfolioApiUrl}/api/v1/workspace/google/connect`;
              }}
            >
              Connect Workspace
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="owner-bookings-error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? (
        <>
          <div className="owner-booking-list" aria-hidden="true">
            {Array.from({ length: isPending ? 2 : 1 }).map((_, index) => (
              <article
                className="owner-booking-card owner-booking-skeleton-card"
                key={`${status}-booking-skeleton-${index}`}
              >
                <Skeleton className="skeleton-pill skeleton-pill-small" />
                <Skeleton className="skeleton-line skeleton-line-title" />
                <Skeleton className="skeleton-line skeleton-line-wide" />
                <Skeleton className="skeleton-line" />
                <div className="skeleton-card-footer">
                  <Skeleton className="skeleton-pill" />
                  <Skeleton className="skeleton-pill skeleton-pill-small" />
                </div>
              </article>
            ))}
          </div>
          <p className="owner-bookings-state" role="status">
            <LoaderCircle className="is-spinning" aria-hidden="true" /> Loading
            bookings…
          </p>
        </>
      ) : bookings.length === 0 ? (
        <p className="owner-bookings-state">
          {isPending
            ? "No booking requests are waiting for review."
            : "No confirmed calls are scheduled yet."}
        </p>
      ) : (
        <div className="owner-booking-list">
          {bookings.map((booking) => (
            <article
              className="owner-booking-card"
              key={booking.id}
              data-scroll-reveal
            >
              <span className="owner-booking-status">
                {isPending ? "Needs review" : "Confirmed"}
              </span>
              <div className="owner-booking-person">
                <strong>{booking.fullName}</strong>
                <a href={`mailto:${booking.email}`}>
                  <Mail aria-hidden="true" /> {booking.email}
                </a>
              </div>
              <p>{booking.topic}</p>
              <div className="owner-booking-time">
                <Clock3 aria-hidden="true" />
                <time dateTime={booking.startsAt}>
                  {new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/Brussels",
                  }).format(new Date(booking.startsAt))}
                </time>
                <span>Europe/Brussels · 30 minutes</span>
              </div>
              {booking.googleMeetUrl ? (
                <a
                  className="owner-booking-meet-link"
                  href={booking.googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Google Meet <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <div className="owner-booking-actions">
                {isPending ? (
                  <>
                    <button
                      type="button"
                      disabled={actingOn === booking.id}
                      onClick={() => void review(booking.id, "confirm")}
                    >
                      <Check aria-hidden="true" /> Confirm
                    </button>
                    <button
                      type="button"
                      disabled={actingOn === booking.id}
                      onClick={() => void review(booking.id, "reject")}
                    >
                      <X aria-hidden="true" /> Reject
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actingOn === booking.id}
                    onClick={() => void review(booking.id, "cancel")}
                  >
                    <X aria-hidden="true" /> Cancel call
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
