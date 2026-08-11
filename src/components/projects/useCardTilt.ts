"use client";

import { useEffect, type RefObject } from "react";

const MAX_TILT = 4;

export function useCardTilt(
  cardRef: RefObject<HTMLDivElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (!enabled) {
      card.removeAttribute("data-pointer-active");
      card.style.setProperty("--rotate-x", "0deg");
      card.style.setProperty("--rotate-y", "0deg");
      return;
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const render = () => {
      const bounds = card.getBoundingClientRect();
      const normalizedX = Math.min(
        1,
        Math.max(-1, ((pointerX - bounds.left) / bounds.width - 0.5) * 2),
      );
      const normalizedY = Math.min(
        1,
        Math.max(-1, ((pointerY - bounds.top) / bounds.height - 0.5) * 2),
      );

      card.style.setProperty("--pointer-x", `${pointerX - bounds.left}px`);
      card.style.setProperty("--pointer-y", `${pointerY - bounds.top}px`);
      card.style.setProperty("--rotate-x", `${normalizedY * -MAX_TILT}deg`);
      card.style.setProperty("--rotate-y", `${normalizedX * MAX_TILT}deg`);
    };

    const handlePointerEnter = () =>
      card.setAttribute("data-pointer-active", "");
    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(render);
    };
    const handlePointerLeave = () => {
      window.cancelAnimationFrame(frameId);
      card.removeAttribute("data-pointer-active");
      card.style.setProperty("--rotate-x", "0deg");
      card.style.setProperty("--rotate-y", "0deg");
    };

    card.addEventListener("pointerenter", handlePointerEnter);
    card.addEventListener("pointermove", handlePointerMove, { passive: true });
    card.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      card.removeEventListener("pointerenter", handlePointerEnter);
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [cardRef, enabled]);
}
