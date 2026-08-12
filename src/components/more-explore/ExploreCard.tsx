"use client";

import { ArrowRight } from "lucide-react";
import { type PointerEvent, useEffect, useRef } from "react";

import type { ExploreItem } from "./exploreData";

type ExploreCardProps = {
  item: ExploreItem;
  index: number;
};

export function ExploreCard({ item, index }: ExploreCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const Icon = item.icon;

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card || event.pointerType === "touch") return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--explore-x", `${x}px`);
      card.style.setProperty("--explore-y", `${y}px`);
      card.style.setProperty("--explore-shift-x", `${(x / width - 0.5) * 8}px`);
      card.style.setProperty(
        "--explore-shift-y",
        `${(y / height - 0.5) * 8}px`,
      );
    });
  };

  const content = (
    <>
      <div className="explore-card-glow" aria-hidden="true" />
      <Icon className="explore-card-watermark" aria-hidden="true" />
      <span className="explore-card-icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="explore-card-copy">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      {item.status === "available" ? (
        <span className="explore-card-action">
          Explore
          <ArrowRight aria-hidden="true" />
        </span>
      ) : (
        <span className="explore-card-status">Coming soon</span>
      )}
    </>
  );

  const sharedProps = {
    className: `explore-card explore-card-${item.accent} explore-card-${item.status}`,
    "data-scroll-reveal": true,
    "data-scroll-delay": index + 1,
    style: { "--explore-index": index } as React.CSSProperties,
  };

  if (item.status === "available" && item.href) {
    return (
      <a
        ref={cardRef}
        {...sharedProps}
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noreferrer noopener" : undefined}
        aria-label={`${item.title}: ${item.description}`}
        onPointerMove={handlePointerMove}
        onPointerEnter={(event) => {
          event.currentTarget.dataset.pointerActive = "true";
        }}
        onPointerLeave={(event) => {
          event.currentTarget.dataset.pointerActive = "false";
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <article {...sharedProps} aria-label={`${item.title}, coming soon`}>
      {content}
    </article>
  );
}
