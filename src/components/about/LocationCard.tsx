"use client";

import Image from "next/image";
import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";
import { useEffect, useState } from "react";

type BrusselsClock = {
  time: string;
  zone: string;
};

function getBrusselsClock(): BrusselsClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  return {
    time: `${parts.find(({ type }) => type === "hour")?.value ?? "--"}:${parts.find(({ type }) => type === "minute")?.value ?? "--"}`,
    zone:
      parts.find(({ type }) => type === "timeZoneName")?.value ??
      "Europe/Brussels",
  };
}

type LocationCardProps = {
  onPreviewStart: () => void;
  onPreviewEnd: () => void;
};

export function LocationCard({
  onPreviewStart,
  onPreviewEnd,
}: LocationCardProps) {
  const { profile } = usePortfolioProfile();
  const [clock, setClock] = useState<BrusselsClock>({
    time: "--:--",
    zone: "Europe/Brussels",
  });

  useEffect(() => {
    const updateClock = () => setClock(getBrusselsClock());
    updateClock();
    const intervalId = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <article
      className="location-card"
      tabIndex={0}
      aria-label="Brussels location — preview city image"
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreviewStart}
      onBlur={onPreviewEnd}
    >
      <Image
        src="/about/world-map.png"
        alt="Dark world map centered on Europe"
        fill
        sizes="(max-width: 760px) calc(100vw - 32px), 30vw"
        style={{ objectPosition: "50% 50%" }}
      />
      <div className="location-overlay" />
      <div className="location-scan" aria-hidden="true" />
      <div className="location-copy">
        <div>
          <h3>{profile.location}</h3>
          <p>50.8503° N, 4.3517° E</p>
        </div>
        <div className="location-time" aria-live="off">
          <time>{clock.time}</time>
          <span>{clock.zone}</span>
        </div>
      </div>
    </article>
  );
}
