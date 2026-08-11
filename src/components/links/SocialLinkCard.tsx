"use client";

import { ArrowUpRight } from "lucide-react";
import { type PointerEvent, useEffect, useRef } from "react";

import type { SocialLink } from "./linksData";

type SocialLinkCardProps = {
  link: SocialLink;
  index: number;
};

export function SocialLinkCard({ link, index }: SocialLinkCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const Icon = link.icon;

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;

    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--link-pointer-x", `${x}px`);
      card.style.setProperty("--link-pointer-y", `${y}px`);
    });
  };

  return (
    <a
      ref={cardRef}
      className="social-link-card links-enter"
      style={{ "--links-index": index } as React.CSSProperties}
      href={link.href}
      target={link.type === "external" ? "_blank" : undefined}
      rel={link.type === "external" ? "noopener noreferrer" : undefined}
      aria-label={link.accessibleLabel}
      onPointerMove={handlePointerMove}
    >
      <span className="social-link-glow" aria-hidden="true" />
      <span className="social-link-icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="social-link-copy">
        <strong>{link.name}</strong>
        {link.detail ? <small>{link.detail}</small> : null}
      </span>
      <ArrowUpRight className="social-link-arrow" aria-hidden="true" />
    </a>
  );
}
