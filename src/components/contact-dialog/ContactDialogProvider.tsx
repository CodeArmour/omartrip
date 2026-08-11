"use client";

import { CalendarDays, Check, Copy, Mail, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FaLinkedin } from "react-icons/fa6";
import { SiGithub, SiGmail } from "react-icons/si";
import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";

type ContactDialogContextValue = {
  openContactDialog: (trigger?: HTMLElement) => void;
};

const ContactDialogContext = createContext<ContactDialogContextValue | null>(
  null,
);

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useContactDialog() {
  const context = useContext(ContactDialogContext);
  if (!context) {
    throw new Error(
      "useContactDialog must be used inside ContactDialogProvider",
    );
  }
  return context;
}

export function ContactDialogProvider({ children }: { children: ReactNode }) {
  const { profile } = usePortfolioProfile();
  const pathname = usePathname();
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const initialPathnameRef = useRef(pathname);

  const openContactDialog = useCallback((trigger?: HTMLElement) => {
    triggerRef.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setCopyStatus("idle");
    setIsClosing(false);
    setIsRendered(true);
  }, []);

  const finishClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsRendered(false);
    setIsClosing(false);
    setCopyStatus("idle");
  }, []);

  const closeContactDialog = useCallback(() => {
    if (!isRendered || isClosing) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      finishClose();
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(finishClose, 340);
  }, [finishClose, isClosing, isRendered]);

  useEffect(() => {
    if (initialPathnameRef.current === pathname) return;
    initialPathnameRef.current = pathname;
    if (!isRendered) return;
    const routeCloseTimer = window.setTimeout(finishClose, 0);
    return () => window.clearTimeout(routeCloseTimer);
  }, [finishClose, isRendered, pathname]);

  useEffect(() => {
    if (!isRendered) return;

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const backgroundNodes = Array.from(document.body.children).filter(
      (node) =>
        !(
          node instanceof HTMLElement &&
          node.dataset.contactDialogPortal !== undefined
        ),
    );
    const previousAccessibility = backgroundNodes.map((node) => ({
      node,
      ariaHidden: node.getAttribute("aria-hidden"),
      inert: node instanceof HTMLElement ? node.inert : false,
    }));

    backgroundNodes.forEach((node) => {
      node.setAttribute("aria-hidden", "true");
      if (node instanceof HTMLElement) node.inert = true;
    });

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusFrame = requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeContactDialog();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      Object.assign(document.body.style, previousBodyStyles);
      previousAccessibility.forEach(({ node, ariaHidden, inert }) => {
        if (ariaHidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", ariaHidden);
        if (node instanceof HTMLElement) node.inert = inert;
      });
      triggerRef.current?.focus({ preventScroll: true });
      if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    };
  }, [closeContactDialog, isRendered]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null)
        window.clearTimeout(closeTimerRef.current);
      if (copyTimerRef.current !== null)
        window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const handleCopyEmail = async () => {
    if (copyTimerRef.current !== null)
      window.clearTimeout(copyTimerRef.current);
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    copyTimerRef.current = window.setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const value = useMemo(() => ({ openContactDialog }), [openContactDialog]);

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      {isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`contact-dialog-portal${isClosing ? " is-closing" : ""}`}
              data-contact-dialog-portal
            >
              <div
                className="contact-dialog-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget)
                    closeContactDialog();
                }}
              >
                <div
                  ref={dialogRef}
                  className="contact-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="contact-dialog-title"
                  aria-describedby="contact-dialog-description"
                >
                  <span className="contact-dialog-handle" aria-hidden="true" />
                  <button
                    ref={closeButtonRef}
                    className="contact-dialog-close"
                    type="button"
                    aria-label="Close contact dialog"
                    onClick={closeContactDialog}
                  >
                    <X aria-hidden="true" />
                  </button>

                  <header className="contact-dialog-heading">
                    <p className="eyebrow">Start a conversation</p>
                    <h2 id="contact-dialog-title">Get in touch</h2>
                    <p id="contact-dialog-description">
                      Let&apos;s build something great together.
                    </p>
                  </header>

                  <div className="contact-dialog-actions">
                    <Link
                      className="contact-action-card"
                      href="/book"
                      aria-label="Book a 30-minute call with Omar Abusahmoud"
                      onClick={closeContactDialog}
                    >
                      <CalendarDays aria-hidden="true" />
                      <span>
                        <strong>Book a call</strong>
                        <small>30 min call</small>
                      </span>
                    </Link>

                    <a
                      className="contact-action-card"
                      href={`mailto:${profile.email}?subject=Project%20inquiry%20from%20your%20portfolio`}
                      aria-label="Send an email to Omar Abusahmoud"
                      onClick={closeContactDialog}
                    >
                      <Mail aria-hidden="true" />
                      <span>
                        <strong>Email me</strong>
                        <small>Open email</small>
                      </span>
                    </a>
                  </div>

                  <footer className="contact-dialog-footer">
                    <button
                      className={`copy-email-button is-${copyStatus}`}
                      type="button"
                      onClick={handleCopyEmail}
                    >
                      {copyStatus === "copied" ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Copy aria-hidden="true" />
                      )}
                      <span>
                        {copyStatus === "copied"
                          ? "Email copied"
                          : copyStatus === "failed"
                            ? "Copy failed"
                            : "Copy email address"}
                      </span>
                    </button>

                    <nav
                      className="contact-social-links"
                      aria-label="Contact links"
                    >
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit Omar Abusahmoud on GitHub"
                      >
                        <SiGithub aria-hidden="true" />
                      </a>
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit Omar Abusahmoud on LinkedIn"
                      >
                        <FaLinkedin aria-hidden="true" />
                      </a>
                      <a
                        href={`mailto:${profile.email}`}
                        aria-label="Send an email to Omar Abusahmoud"
                      >
                        <SiGmail aria-hidden="true" />
                      </a>
                    </nav>
                  </footer>

                  <p className="sr-only" aria-live="polite">
                    {copyStatus === "copied"
                      ? "Email address copied to clipboard."
                      : copyStatus === "failed"
                        ? "Could not copy the email address."
                        : ""}
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </ContactDialogContext.Provider>
  );
}
