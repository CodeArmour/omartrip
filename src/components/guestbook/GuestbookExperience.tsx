"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  Check,
  EyeOff,
  Inbox,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8081";
const MAX_LENGTH = 280;
type AuthProvider = { id: string; authorizationUrl: string };
type AuthStatus = {
  authenticated: boolean;
  admin: boolean;
  displayName?: string;
  avatarUrl?: string;
};
type CsrfMetadata = { token: string; headerName: string };
type GuestbookMessage = {
  id: string;
  content: string;
  status: "visible" | "hidden" | "pending";
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  user: { id: string; displayName: string; avatarUrl?: string };
};
type MessagePage = { messages: GuestbookMessage[] };

const DEFAULT_PROVIDERS: AuthProvider[] = [
  { id: "github", authorizationUrl: "/oauth2/authorization/github" },
  { id: "google", authorizationUrl: "/oauth2/authorization/google" },
];

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      body?.message ?? "The guestbook request could not be completed.",
    );
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="guestbook-message-avatar"
      role={url ? "img" : undefined}
      aria-label={url ? `${name}'s profile photo` : undefined}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    >
      {!url && initials}
    </span>
  );
}

export function GuestbookExperience() {
  const [providers, setProviders] = useState<AuthProvider[]>(DEFAULT_PROVIDERS);
  const [auth, setAuth] = useState<AuthStatus>({
    authenticated: false,
    admin: false,
  });
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [pending, setPending] = useState<GuestbookMessage[]>([]);
  const [ownMessage, setOwnMessage] = useState<GuestbookMessage | null>(null);
  const [content, setContent] = useState("");
  const [csrf, setCsrf] = useState<CsrfMetadata | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [providerData, authData, wall] = await Promise.all([
        apiFetch<AuthProvider[]>("/api/v1/auth/providers"),
        apiFetch<AuthStatus>("/api/v1/auth/me"),
        apiFetch<MessagePage>("/api/v1/guestbook/messages?size=50"),
      ]);
      setProviders(providerData.length > 0 ? providerData : DEFAULT_PROVIDERS);
      setAuth(authData);
      setMessages(wall.messages);
      if (authData.authenticated) {
        setCsrf(await apiFetch<CsrfMetadata>("/api/v1/auth/csrf"));
        setOwnMessage(
          (await apiFetch<GuestbookMessage | undefined>(
            "/api/v1/guestbook/messages/mine",
          )) ?? null,
        );
      }
      if (authData.admin)
        setPending(
          (
            await apiFetch<MessagePage>(
              "/api/v1/guestbook/moderation/messages?size=50",
            )
          ).messages,
        );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Guestbook unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function csrfHeaders() {
    const metadata =
      csrf ?? (await apiFetch<CsrfMetadata>("/api/v1/auth/csrf"));
    setCsrf(metadata);
    return { [metadata.headerName]: metadata.token };
  }

  async function saveMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = content.trim();
    if (value.length < 2 || value.length > MAX_LENGTH) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const path =
        editing && ownMessage
          ? `/api/v1/guestbook/messages/${ownMessage.id}`
          : "/api/v1/guestbook/messages";
      const saved = await apiFetch<GuestbookMessage>(path, {
        method: editing ? "PATCH" : "POST",
        headers: await csrfHeaders(),
        body: JSON.stringify({ content: value }),
      });
      setOwnMessage(saved);
      setEditing(false);
      setContent("");
      setMessages((current) =>
        current.filter((message) => message.id !== saved.id),
      );
      setNotice(
        editing
          ? "Your message was updated and sent for review."
          : "Your message was sent for review.",
      );
      if (auth.admin)
        setPending(
          (
            await apiFetch<MessagePage>(
              "/api/v1/guestbook/moderation/messages?size=50",
            )
          ).messages,
        );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Message could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteOwnMessage() {
    if (!ownMessage) return;
    setSubmitting(true);
    setError("");
    try {
      await apiFetch<void>(`/api/v1/guestbook/messages/${ownMessage.id}`, {
        method: "DELETE",
        headers: await csrfHeaders(),
      });
      setMessages((current) =>
        current.filter((message) => message.id !== ownMessage.id),
      );
      setPending((current) =>
        current.filter((message) => message.id !== ownMessage.id),
      );
      setOwnMessage(null);
      setEditing(false);
      setContent("");
      setNotice("Your message was deleted. You can leave a new one.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Message could not be deleted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function moderate(
    message: GuestbookMessage,
    action: "approve" | "hide",
  ) {
    setModeratingId(message.id);
    setError("");
    setNotice("");
    try {
      const updated = await apiFetch<GuestbookMessage>(
        `/api/v1/guestbook/moderation/messages/${message.id}/${action}`,
        { method: "PATCH", headers: await csrfHeaders() },
      );
      setPending((current) => current.filter((item) => item.id !== message.id));
      if (updated.status === "visible") {
        setMessages((current) => [updated, ...current]);
      } else {
        setMessages((current) =>
          current.filter((item) => item.id !== message.id),
        );
      }
      if (ownMessage?.id === updated.id)
        setOwnMessage(updated.status === "hidden" ? null : updated);
      setNotice(
        action === "approve" ? "Message published." : "Message hidden.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Review action failed.",
      );
    } finally {
      setModeratingId(null);
    }
  }

  async function signOut() {
    try {
      await apiFetch<void>("/api/v1/auth/logout", {
        method: "POST",
        headers: await csrfHeaders(),
      });
      setAuth({ authenticated: false, admin: false });
      setOwnMessage(null);
      setPending([]);
      setCsrf(null);
      setNotice("You are signed out.");
      window.dispatchEvent(new Event("portfolio-auth-changed"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign out failed.");
    }
  }

  const composer = (
    <form
      className="guestbook-composer"
      onSubmit={(event) => void saveMessage(event)}
    >
      <label htmlFor="guestbook-message">Your message</label>
      <textarea
        id="guestbook-message"
        value={content}
        onChange={(event) =>
          setContent(event.target.value.slice(0, MAX_LENGTH))
        }
        minLength={2}
        maxLength={MAX_LENGTH}
        required
        placeholder="Leave a message for the community…"
      />
      <div>
        <span>
          {content.length} / {MAX_LENGTH}
        </span>
        <span className="guestbook-composer-actions">
          <button
            type="submit"
            disabled={submitting || content.trim().length < 2}
          >
            {submitting ? (
              <LoaderCircle className="is-spinning" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
            {editing ? "Update" : "Send"}
          </button>
          {editing && (
            <button
              type="button"
              className="guestbook-edit-cancel"
              onClick={() => {
                setEditing(false);
                setContent("");
              }}
            >
              Cancel
            </button>
          )}
        </span>
      </div>
    </form>
  );

  return (
    <>
      <section
        className="guestbook-auth-panel guestbook-enter guestbook-enter-panel"
        aria-labelledby="guestbook-auth-title"
      >
        {auth.authenticated ? (
          <div className="guestbook-composer-layout">
            <div className="guestbook-signed-user">
              <Avatar
                name={auth.displayName ?? "Visitor"}
                url={auth.avatarUrl}
              />
              <div className="guestbook-signed-user-copy">
                <h2 id="guestbook-auth-title">{auth.displayName}</h2>
                <button
                  type="button"
                  className="guestbook-signout guestbook-signout-link"
                  onClick={() => void signOut()}
                >
                  Sign out
                </button>
              </div>
            </div>
            {ownMessage && !editing ? (
              <div className="guestbook-own-state">
                <h3>You&apos;ve already left your mark! &#10024;</h3>
                <p>You can edit or delete your message below.</p>
                <article className="guestbook-message-card guestbook-own-message">
                  <Avatar
                    name={ownMessage.user.displayName}
                    url={ownMessage.user.avatarUrl}
                  />
                  <div className="guestbook-message-content">
                    <header>
                      <div>
                        <h3>{ownMessage.user.displayName}</h3>
                        <p>
                          {ownMessage.status === "pending"
                            ? "Awaiting approval"
                            : "Published"}
                        </p>
                      </div>
                      <span>{ownMessage.status}</span>
                    </header>
                    <p>{ownMessage.content}</p>
                  </div>
                  <div className="guestbook-own-actions">
                    <button
                      type="button"
                      aria-label="Edit your guestbook message"
                      onClick={() => {
                        setContent(ownMessage.content);
                        setEditing(true);
                      }}
                    >
                      <Pencil aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete your guestbook message"
                      disabled={submitting}
                      onClick={() => void deleteOwnMessage()}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </div>
            ) : (
              composer
            )}
          </div>
        ) : (
          <div className="guestbook-signin-layout">
            <ShieldCheck className="guestbook-panel-icon" aria-hidden="true" />
            <div className="guestbook-auth-copy">
              <h2 id="guestbook-auth-title">
                Sign in to pin your message to this board forever.
              </h2>
            </div>
            <div className="guestbook-provider-actions">
              {providers.map((provider) => (
                <a
                  key={provider.id}
                  href={`${API_URL}${provider.authorizationUrl}`}
                  className="guestbook-provider-button"
                >
                  {provider.id === "github" ? (
                    <SiGithub aria-hidden="true" />
                  ) : (
                    <FcGoogle aria-hidden="true" />
                  )}
                  Sign in with {provider.id === "github" ? "GitHub" : "Google"}
                </a>
              ))}
            </div>
            {loading && (
              <span className="guestbook-loading" role="status">
                <LoaderCircle aria-hidden="true" /> Checking your session…
              </span>
            )}
          </div>
        )}
        {(notice || error) && (
          <p
            className={`guestbook-feedback ${error ? "is-error" : ""}`}
            role="status"
            aria-live="polite"
          >
            {error || notice}
          </p>
        )}
      </section>
      {auth.admin && (
        <section
          className="guestbook-review-panel"
          aria-labelledby="guestbook-review-title"
        >
          <div className="guestbook-wall-heading guestbook-review-heading">
            <div>
              <p className="eyebrow">
                <ShieldCheck aria-hidden="true" /> Owner moderation
              </p>
              <h2 id="guestbook-review-title">Awaiting review</h2>
              <p className="guestbook-review-description">
                Review community messages before they appear publicly.
              </p>
            </div>
            <span>
              <Inbox aria-hidden="true" /> {pending.length} pending
            </span>
          </div>
          {pending.length === 0 ? (
            <div className="guestbook-empty guestbook-review-empty">
              <Check aria-hidden="true" />
              <h3>All caught up.</h3>
              <p>No messages are waiting for review.</p>
            </div>
          ) : (
            <div className="guestbook-review-list">
              {pending.map((message) => (
                <article
                  className="guestbook-message-card guestbook-review-card"
                  key={message.id}
                >
                  <Avatar
                    name={message.user.displayName}
                    url={message.user.avatarUrl}
                  />
                  <div className="guestbook-message-content">
                    <header>
                      <div>
                        <h3>{message.user.displayName}</h3>
                        <p>
                          <CalendarClock aria-hidden="true" />
                          <time dateTime={message.createdAt}>
                            {new Intl.DateTimeFormat("en-GB", {
                              dateStyle: "medium",
                            }).format(new Date(message.createdAt))}
                          </time>
                        </p>
                      </div>
                      <span>Needs review</span>
                    </header>
                    <blockquote>{message.content}</blockquote>
                    <div className="guestbook-review-actions">
                      <button
                        type="button"
                        className="guestbook-review-approve"
                        disabled={moderatingId === message.id}
                        onClick={() => void moderate(message, "approve")}
                      >
                        {moderatingId === message.id ? (
                          <LoaderCircle
                            className="is-spinning"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check aria-hidden="true" />
                        )}
                        Approve &amp; publish
                      </button>
                      <button
                        type="button"
                        disabled={moderatingId === message.id}
                        onClick={() => void moderate(message, "hide")}
                      >
                        <EyeOff aria-hidden="true" /> Hide
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      <section
        className="guestbook-wall"
        aria-labelledby="guestbook-wall-title"
      >
        <div className="guestbook-wall-heading">
          <div>
            <p className="eyebrow">Community messages</p>
            <h2 id="guestbook-wall-title">The wall</h2>
          </div>
          <span>{messages.length} published</span>
        </div>
        {messages.length === 0 ? (
          <div className="guestbook-empty">
            <MessageSquareText aria-hidden="true" />
            <h3>Be the first to leave a mark.</h3>
          </div>
        ) : (
          <div className="guestbook-message-list">
            {messages.map((message) => (
              <article className="guestbook-message-card" key={message.id}>
                <Avatar
                  name={message.user.displayName}
                  url={message.user.avatarUrl}
                />
                <div className="guestbook-message-content">
                  <header>
                    <div>
                      <h3>{message.user.displayName}</h3>
                      <p>
                        <time dateTime={message.createdAt}>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </time>
                        {message.edited && " · Edited"}
                      </p>
                    </div>
                    <span>Published</span>
                  </header>
                  <p>{message.content}</p>
                  {auth.admin ? (
                    <div className="guestbook-published-owner-actions">
                      <button
                        type="button"
                        disabled={moderatingId === message.id}
                        aria-label={`Hide message from ${message.user.displayName}`}
                        onClick={() => void moderate(message, "hide")}
                      >
                        <EyeOff aria-hidden="true" /> Hide from wall
                      </button>
                    </div>
                  ) : null}
                </div>
                <MessageSquareText
                  className="guestbook-message-watermark"
                  aria-hidden="true"
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
