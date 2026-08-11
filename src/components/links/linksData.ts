import { BriefcaseBusiness, Code2, Mail, type LucideIcon } from "lucide-react";

import type { PortfolioProfile } from "@/config/profile";

export type SocialLink = {
  name: string;
  detail?: string;
  href: string;
  icon: LucideIcon;
  type: "external" | "email";
  accessibleLabel: string;
};

function externalUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function socialLinksFromProfile(
  profile: PortfolioProfile,
): SocialLink[] {
  return [
    {
      name: "GitHub",
      detail: "CodeArmour",
      href: externalUrl(profile.githubUrl),
      icon: Code2,
      type: "external",
      accessibleLabel: "Visit Omar Abusahmoud on GitHub",
    },
    {
      name: "LinkedIn",
      detail: "Omar Maysara",
      href: externalUrl(profile.linkedinUrl),
      icon: BriefcaseBusiness,
      type: "external",
      accessibleLabel: "Visit Omar Abusahmoud on LinkedIn",
    },
    {
      name: "Email",
      detail: "Business enquiries",
      href: `mailto:${profile.email}`,
      icon: Mail,
      type: "email",
      accessibleLabel: "Send an email to Omar Abusahmoud",
    },
  ];
}
