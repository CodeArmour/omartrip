"use client";

import {
  CalendarClock,
  ChevronDown,
  LogIn,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";

import { usePortfolioAuth } from "./PortfolioAuthProvider";

export function PortfolioAccountControl() {
  const { session, providers, loading, providersLoading, signIn, signOut } =
    usePortfolioAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  if (loading)
    return (
      <div className="nav-account" ref={rootRef}>
        <button
          type="button"
          className="nav-control nav-account-control is-loading"
          aria-label="Checking sign-in status"
          disabled
        >
          <Loader2 aria-hidden="true" className="nav-account-spinner" />
          <span className="nav-account-label">Checking</span>
        </button>
      </div>
    );

  return (
    <div className="nav-account" ref={rootRef}>
      <button
        type="button"
        className={`nav-control nav-account-control${session.admin ? " is-owner" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={session.authenticated ? "Open account menu" : "Sign in"}
        onClick={() => setOpen((current) => !current)}
      >
        {session.avatarUrl ? (
          <span
            className="nav-account-avatar"
            style={{ backgroundImage: `url(${session.avatarUrl})` }}
            role="img"
            aria-label="Your profile photo"
          />
        ) : (
          <LogIn aria-hidden="true" size={17} />
        )}
        <span className="nav-account-label">
          {session.authenticated ? session.displayName : "Sign in"}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="nav-account-chevron"
          size={14}
        />
      </button>

      {open ? (
        <div className="nav-account-menu" role="menu">
          {session.authenticated ? (
            <>
              <div className="nav-account-identity">
                <strong>{session.displayName ?? "Portfolio visitor"}</strong>
                <span>{session.admin ? "Owner account" : "Signed in"}</span>
              </div>
              {session.admin ? (
                <Link
                  href="/book#owner-bookings"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <CalendarClock aria-hidden="true" />
                  Review bookings
                </Link>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => void signOut()}
              >
                <LogOut aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="nav-account-identity">
                <strong>Welcome</strong>
                <span>Sign in to join the guestbook.</span>
              </div>
              {providersLoading ? (
                <p className="nav-account-loading">Loading sign-in options…</p>
              ) : null}
              {!providersLoading && providers.length === 0 ? (
                <p>Sign-in providers are unavailable.</p>
              ) : null}
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  role="menuitem"
                  onClick={() => signIn(provider.id)}
                >
                  {provider.id === "github" ? (
                    <SiGithub aria-hidden="true" />
                  ) : (
                    <FcGoogle aria-hidden="true" />
                  )}
                  Continue with {provider.id === "github" ? "GitHub" : "Google"}
                </button>
              ))}
            </>
          )}
          {session.admin ? (
            <span className="nav-owner-mark">
              <ShieldCheck aria-hidden="true" /> Owner controls are enabled
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
