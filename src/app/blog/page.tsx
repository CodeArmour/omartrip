import type { Metadata } from "next";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { BlogExperience } from "@/components/blog/BlogExperience";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageBackLink } from "@/components/links/PageBackLink";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog | Omar Abusahmoud",
  description:
    "Articles and technical notes from Omar Abusahmoud about software, product thinking, cloud, mobile and AI.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />

      <div className="site-shell">
        <main className="blog-page">
          <div className="blog-page-inner">
            <PageBackLink />

            <header className="blog-hero">
              <p className="eyebrow">Engineering notes</p>
              <h1>
                Omar&apos;s <span>Blog</span>
              </h1>
              <p>
                Practical articles about software, product thinking, cloud,
                mobile, and AI.
              </p>
            </header>

            <BlogExperience />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
