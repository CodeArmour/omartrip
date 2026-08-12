import type { Metadata } from "next";
import Link from "next/link";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { BlogExperience } from "@/components/blog/BlogExperience";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Article | Omar Abusahmoud",
  description: "Read an article from Omar Abusahmoud.",
};

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;

  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />

      <div className="site-shell">
        <main className="blog-page">
          <div className="blog-page-inner">
            <Link className="page-back-link" href="/blog">
              ← Back to blog
            </Link>

            <BlogExperience initialSlug={slug} mode="article" />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
