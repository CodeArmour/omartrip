"use client";

import { useEffect } from "react";

export function ThemeBootstrap() {
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("omar-portfolio-theme");
      const theme = stored === "light" || stored === "dark" ? stored : "dark";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  }, []);

  return null;
}
