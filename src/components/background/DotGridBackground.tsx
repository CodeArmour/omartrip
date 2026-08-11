"use client";

import { useEffect, useRef } from "react";

const EASING = 0.14;
const SETTLE_THRESHOLD = 0.12;

export function DotGridBackground() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canTrackPointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!layer || !canTrackPointer.matches || reducedMotion.matches) {
      return;
    }

    let frameId = 0;
    let isAnimating = false;
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    const target = { ...current };

    const render = () => {
      current.x += (target.x - current.x) * EASING;
      current.y += (target.y - current.y) * EASING;

      layer.style.setProperty("--cursor-x", `${current.x}px`);
      layer.style.setProperty("--cursor-y", `${current.y}px`);

      const hasSettled =
        Math.abs(target.x - current.x) < SETTLE_THRESHOLD &&
        Math.abs(target.y - current.y) < SETTLE_THRESHOLD;

      if (hasSettled) {
        isAnimating = false;
        return;
      }

      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;

      if (!isAnimating) {
        isAnimating = true;
        frameId = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={layerRef} className="dot-grid" aria-hidden="true" />;
}
