"use client";

import { FaLinkedin } from "react-icons/fa6";
import { SiGithub, SiGmail } from "react-icons/si";

import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";
import { navigationItems } from "@/components/navigation/navigation";

export function SiteFooter() {
  const { profile } = usePortfolioProfile();
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-mark">OA</p>
        <p className="footer-note">
          {profile.fullName} · {profile.location}
        </p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        {navigationItems.map(({ id, label }) => (
          <a key={id} href={`/#${id}`}>
            {label}
          </a>
        ))}
      </nav>
      <div className="footer-meta">
        <nav className="footer-social-links" aria-label="Social media links">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Omar Abusahmoud on GitHub"
          >
            <SiGithub aria-hidden="true" />
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Omar Abusahmoud on LinkedIn"
          >
            <FaLinkedin aria-hidden="true" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Send an email to Omar Abusahmoud"
          >
            <SiGmail aria-hidden="true" />
          </a>
        </nav>
        <p className="footer-note">
          © {new Date().getFullYear()} {profile.fullName}
        </p>
      </div>
    </footer>
  );
}
