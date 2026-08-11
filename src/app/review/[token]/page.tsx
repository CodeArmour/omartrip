import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { ProjectReviewForm } from "@/components/projects/ProjectReviewForm";

export const metadata: Metadata = {
  title: "Share Your Review | Omar Abusahmoud",
  description: "Share feedback about a project created by Omar Abusahmoud.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ProjectReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />
      <div className="site-shell">
        <main className="project-review-page">
          <ProjectReviewForm token={token} />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
