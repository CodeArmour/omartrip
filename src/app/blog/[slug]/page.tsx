import type { Metadata } from "next";
import Link from "next/link";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { BlogExperience } from "@/components/blog/BlogExperience";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { buildPageMetadata, getBlogPostSeo } from "@/lib/seo";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostSeo(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Article | Omar Abusahmoud",
      description: "Read an article from Omar Abusahmoud.",
      path: `/blog/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${post.title} | Omar Abusahmoud`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.imageUrl,
    imageAlt: post.imageAlt || `${post.title} article cover`,
  });
}

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
