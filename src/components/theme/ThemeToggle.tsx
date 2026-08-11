"use client";

import { MoonStar, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "omar-portfolio-theme";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

function getDocumentTheme(): ThemeMode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    getDocumentTheme,
    () => "dark",
  );

  const toggleTheme = () => {
    const nextTheme: ThemeMode =
      getDocumentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const isLight = theme === "light";

  return (
    <button
      className="nav-control nav-theme-control"
      type="button"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={isLight}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icons" aria-hidden="true">
        <Sun className="theme-icon-sun" size={19} strokeWidth={1.8} />
        <MoonStar className="theme-icon-moon" size={19} strokeWidth={1.8} />
      </span>
    </button>
  );
}
