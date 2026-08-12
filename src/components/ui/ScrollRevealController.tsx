"use client";

import { useEffect } from "react";

const revealSelector = "[data-scroll-reveal]";
const progressSelector = "[data-scroll-progress]";

export function ScrollRevealController() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<HTMLElement>();
    let frame = 0;

    document.body.classList.add("scroll-reveal-ready");

    const elements = () =>
      Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const progressElements = () =>
      Array.from(document.querySelectorAll<HTMLElement>(progressSelector));

    if (motionQuery.matches) {
      elements().forEach((element) => element.classList.add("is-revealed"));
      progressElements().forEach((element) => {
        element.style.setProperty("--scroll-progress", "1");
        element.style.setProperty("--scroll-hidden", "0");
      });
      return () => document.body.classList.remove("scroll-reveal-ready");
    }

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const updateProgress = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;
      progressElements().forEach((element) => {
        const rect = element.getBoundingClientRect();
        const start = viewportHeight * 0.92;
        const end = viewportHeight * 0.2;
        const progress = clamp((start - rect.top) / (start - end));
        element.style.setProperty("--scroll-progress", progress.toFixed(4));
        element.style.setProperty("--scroll-hidden", (1 - progress).toFixed(4));
      });
    };

    const scheduleProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08,
      },
    );

    const observeElements = () => {
      elements().forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        observer.observe(element);
      });
    };

    observeElements();
    updateProgress();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
      scheduleProgress();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      document.body.classList.remove("scroll-reveal-ready");
    };
  }, []);

  return null;
}
