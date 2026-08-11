import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { GuestbookExperience } from "@/components/guestbook/GuestbookExperience";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageBackLink } from "@/components/links/PageBackLink";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";

export const metadata: Metadata = {
  title: "Guestbook | Omar Abusahmoud",
  description: "Leave a message on Omar Abusahmoud’s community wall.",
};

export default function GuestbookPage() {
  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />

      <div className="site-shell">
        <main className="guestbook-page">
          <div className="guestbook-page-inner">
            <PageBackLink />

            <header className="guestbook-hero guestbook-enter guestbook-enter-hero">
              <p className="eyebrow">The community wall</p>
              <h1>
                Leave Your <span>Mark</span>
              </h1>
              <p>Share your thoughts, feedback, or just say hi!</p>
            </header>

            <GuestbookExperience />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
