import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
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
            <p className="eyebrow">30 minute session</p>
            <h1>
              Let&apos;s bring your <span>ideas</span> to life
            </h1>
            <p>Select a date and time below to schedule our call.</p>
          </header>
          <BookingScheduler />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
