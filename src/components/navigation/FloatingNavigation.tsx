"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BookCallButton } from "@/components/contact-dialog/BookCallButton";
import { PortfolioAccountControl } from "@/components/auth/PortfolioAccountControl";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { navigationItems, type NavigationId } from "./navigation";

const observerOptions: IntersectionObserverInit = {
  rootMargin: "-32% 0px -67% 0px",
  threshold: 0,
};

export function FloatingNavigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [activeSection, setActiveSection] = useState<NavigationId>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;

    const sections = navigationItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const updateActiveSection = () => {
      const readingLine = window.innerHeight * 0.325;
      const currentSection = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= readingLine && bounds.bottom > readingLine;
      });

      if (currentSection) {
        setActiveSection(currentSection.id as NavigationId);
      }
    };

    const observer = new IntersectionObserver(
      () => updateActiveSection(),
      observerOptions,
    );

    sections.forEach((section) => observer.observe(section));
    updateActiveSection();

    return () => observer.disconnect();
  }, [isHomePage]);

  const navigateTo = (id: NavigationId) => {
    const section = document.getElementById(id);

    if (!section) return;

    setActiveSection(id);
    setMobileMenuOpen(false);
    const targetTop =
      id === "home"
        ? 0
        : Math.max(
            0,
            window.scrollY + section.getBoundingClientRect().top - 16,
          );
    window.scrollTo({ top: targetTop, behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`);
  };

  return (
    <header className="floating-nav-shell">
      <div className="nav-left-controls">
        <button
          className="nav-control nav-menu-control"
          type="button"
          aria-label={
            mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-controls="primary-navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? (
            <X aria-hidden="true" size={18} strokeWidth={2} />
          ) : (
            <Menu aria-hidden="true" size={18} strokeWidth={2} />
          )}
        </button>
        <ThemeToggle />
      </div>

      <nav
        id="primary-navigation"
        className={`nav-pill${mobileMenuOpen ? " is-mobile-open" : ""}`}
        aria-label="Primary navigation"
      >
        {navigationItems.map(({ label, id }) => {
          const isActive = isHomePage && activeSection === id;

          return isHomePage ? (
            <button
              key={id}
              className="nav-link"
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => navigateTo(id)}
            >
              {label}
            </button>
          ) : (
            <Link
              key={id}
              className="nav-link"
              href={`/#${id}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-right-controls">
        <PortfolioAccountControl />
        <BookCallButton
          className="nav-control nav-call-control"
          aria-label="Book a call with Omar"
        >
          <span>Book a Call</span>
        </BookCallButton>
      </div>
    </header>
  );
}
