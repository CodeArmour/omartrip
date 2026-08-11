"use client";

import { SocialLinkCard } from "./SocialLinkCard";
import { socialLinksFromProfile } from "./linksData";
import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";

export function SocialLinksList() {
  const { profile } = usePortfolioProfile();
  const socialLinks = socialLinksFromProfile(profile);
  return (
    <div className="social-links-list" aria-label="Omar's social links">
      {socialLinks.map((link, index) => (
        <SocialLinkCard key={link.name} link={link} index={index} />
      ))}
    </div>
  );
}
