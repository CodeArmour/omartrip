"use client";

import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";

export function IdentityCard() {
  const { profile } = usePortfolioProfile();
  return (
    <article className="about-card identity-card">
      <p className="identity-name">{profile.fullName}</p>
      <p className="identity-role">{profile.role}</p>
    </article>
  );
}
