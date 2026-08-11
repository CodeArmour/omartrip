"use client";

import { Check, LoaderCircle, Send, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";

import {
  portfolioApiUrl,
  usePortfolioAuth,
} from "@/components/auth/PortfolioAuthProvider";

type Invitation = {
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectImage: string;
  expiresAt: string;
};

export function ProjectReviewForm({ token }: { token: string }) {
  const {
    session,
    providers,
    loading: authLoading,
    signIn,
    csrfHeaders,
  } = usePortfolioAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewLength, setReviewLength] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${portfolioApiUrl}/api/v1/projects/reviews/${token}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            "This review link is expired or has already been used.",
          );
        setInvitation((await response.json()) as Invitation);
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError(
          reason instanceof Error
            ? reason.message
            : "This review link is unavailable.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/projects/reviews/${token}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(await csrfHeaders()),
          },
          body: JSON.stringify({
            rating,
            review: String(data.get("review")),
          }),
        },
      );
      if (!response.ok) {
        const details = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(details?.message ?? "Your review could not be saved.");
      }
      setSubmitted(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your review could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="project-review-state" role="status">
        <LoaderCircle className="is-spinning" aria-hidden="true" />
        <p>Opening your review invitation…</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="project-review-state is-error" role="alert">
        <h1>Review link unavailable</h1>
        <p>{error}</p>
        <Link href="/">Return to Omar&apos;s portfolio</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="project-review-state is-success" role="status">
        <span>
          <Check aria-hidden="true" />
        </span>
        <p className="eyebrow">Review received</p>
        <h1>Thank you for sharing your experience.</h1>
        <p>Your review for {invitation?.projectTitle} has been saved.</p>
        <Link href="/#projects">View Omar&apos;s projects</Link>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <section className="project-review-shell" aria-labelledby="review-title">
      <header className="project-review-intro">
        <p className="eyebrow">Customer review</p>
        <h1 id="review-title">Share your experience</h1>
        <p>
          Your feedback helps tell the story behind the work and the result.
        </p>
      </header>

      <div className="project-review-project">
        <div>
          <Image src={invitation.projectImage} alt="" fill sizes="96px" />
        </div>
        <span>
          <small>{invitation.projectCategory}</small>
          <strong>{invitation.projectTitle}</strong>
        </span>
      </div>

      {!session.authenticated ? (
        <div
          className="project-review-signin"
          aria-labelledby="review-signin-title"
        >
          <div>
            <h2 id="review-signin-title">Sign in to share your review</h2>
            <p>
              Your verified profile name and photo will appear with your review.
            </p>
          </div>
          <div className="project-review-provider-actions">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                disabled={authLoading}
                onClick={() => signIn(provider.id)}
              >
                {provider.id === "github" ? (
                  <SiGithub aria-hidden="true" />
                ) : (
                  <FcGoogle aria-hidden="true" />
                )}
                Sign in with {provider.id === "github" ? "GitHub" : "Google"}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form className="project-review-customer-form" onSubmit={submit}>
          <div className="project-review-identity">
            <span
              aria-hidden="true"
              style={
                session.avatarUrl
                  ? { backgroundImage: `url(${session.avatarUrl})` }
                  : undefined
              }
            >
              {!session.avatarUrl && session.displayName?.charAt(0)}
            </span>
            <div>
              <small>Reviewing as</small>
              <strong>{session.displayName ?? "Signed-in customer"}</strong>
            </div>
          </div>

          <fieldset>
            <legend>Your rating</legend>
            <div className="project-review-rating-input">
              {Array.from({ length: 5 }, (_, index) => index + 1).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} out of 5 stars`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      className={value <= rating ? "is-selected" : undefined}
                      aria-hidden="true"
                    />
                  </button>
                ),
              )}
              <strong>{rating}.0 / 5.0</strong>
            </div>
          </fieldset>

          <label>
            Your review
            <textarea
              name="review"
              minLength={10}
              maxLength={1000}
              required
              placeholder="Tell us about the collaboration and the final result."
              onChange={(event) => setReviewLength(event.target.value.length)}
            />
            <span>{reviewLength} / 1000</span>
          </label>

          {error ? (
            <p className="project-review-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="is-spinning" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
            {submitting ? "Saving review…" : "Submit review"}
          </button>
          <p className="project-review-privacy">
            This private invitation can be used once. Your OAuth profile name,
            photo, rating, and review will appear with the project.
          </p>
        </form>
      )}
    </section>
  );
}
