import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { PageBackLink } from "@/components/links/PageBackLink";
import { SocialLinksList } from "@/components/links/SocialLinksList";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { ProfileOwnerPanel } from "@/components/profile/ProfileOwnerPanel";

export const metadata: Metadata = {
  title: "My Links | Omar Abusahmoud",
  description: "Connect with Omar Abusahmoud across the web.",
};

export default function LinksPage() {
  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />

      <div className="site-shell">
        <main className="links-page">
          <div className="links-page-inner">
            <PageBackLink />

            <header className="links-page-heading links-enter links-enter-heading">
              <p className="eyebrow">Connect with me</p>
              <h1>
                My <span>Links</span>
              </h1>
              <p>Find me across the web and social platforms.</p>
            </header>

            <ProfileOwnerPanel linksOnly showSavedLinks />

            <SocialLinksList />
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
