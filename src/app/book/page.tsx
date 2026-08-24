import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
import { BookCallButton } from "@/components/contact-dialog/BookCallButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";

export const metadata: Metadata = {
  title: "Book a Call | Omar Abusahmoud",
  description: "Schedule a 30-minute call with Omar Abusahmoud.",
};

export default function BookingPage() {
  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />
      <div className="site-shell">
        <main className="booking-page">
          <header className="booking-hero">
            <p className="eyebrow">Have a project in mind?</p>
            <h1>
              Let&apos;s build something that works for your{" "}
              <span>business.</span>
            </h1>
            <p>
              Tell me what you&apos;re looking to build, improve or automate. We
              can have a short conversation about your goals and see how I can
              help.
            </p>
            <BookCallButton className="booking-hero-cta">
              <span>Discuss Your Project</span>
            </BookCallButton>
          </header>
          <BookingScheduler />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
