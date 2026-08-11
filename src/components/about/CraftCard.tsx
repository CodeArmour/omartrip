"use client";

import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";
import { TechTicker } from "./TechTicker";

type CraftCardProps = {
  onPreviewStart: () => void;
  onPreviewEnd: () => void;
};

export function CraftCard({ onPreviewStart, onPreviewEnd }: CraftCardProps) {
  const { profile } = usePortfolioProfile();
  return (
    <article
      className="about-card craft-card"
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreviewStart}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onPreviewEnd();
      }}
    >
      <h3 className="about-card-title">Craft</h3>
      <p className="craft-lead">
        <strong>{profile.services}</strong>
      </p>
      <p className="craft-copy">{profile.aboutBio}</p>

      <TechTicker />

      <div className="craft-availability">
        <p>
          I work closely with teams to choose and build the technology they
          actually need.
        </p>
        <span>
          <i aria-hidden="true" /> Open to collaboration and freelance
        </span>
      </div>
    </article>
  );
}
