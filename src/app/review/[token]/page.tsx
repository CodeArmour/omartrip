import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { ProjectReviewForm } from "@/components/projects/ProjectReviewForm";
import { buildPageMetadata, getReviewInvitationSeo } from "@/lib/seo";

type ProjectReviewPageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: ProjectReviewPageProps): Promise<Metadata> {
  const { token } = await params;
  const invitation = await getReviewInvitationSeo(token);

  return buildPageMetadata({
    title: invitation
      ? `Review ${invitation.projectTitle} | Omar Abusahmoud`
      : "Share Your Review | Omar Abusahmoud",
    description: invitation
      ? `Share feedback for ${invitation.projectTitle}, a ${invitation.projectCategory} project created by Omar Abusahmoud.`
      : "Share feedback about a project created by Omar Abusahmoud.",
    path: `/review/${token}`,
    image: invitation?.projectImage,
    imageAlt: invitation
      ? `${invitation.projectTitle} project review invitation`
      : "Project review invitation for Omar Abusahmoud",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  });
}

export default async function ProjectReviewPage({
  params,
}: ProjectReviewPageProps) {
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
