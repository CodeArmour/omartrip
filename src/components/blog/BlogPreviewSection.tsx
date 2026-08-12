"use client";

import { ArrowUpRight, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { portfolioApiUrl } from "@/components/auth/PortfolioAuthProvider";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { LusterTitle } from "@/components/ui/LusterTitle";

type BlogPreviewPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  publishedAt?: string;
  updatedAt: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || body === null) throw new Error("Blog request failed.");
  return body;
}

function formattedDate(value?: string) {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function BlogPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [posts, setPosts] = useState<BlogPreviewPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const list = await readJson<BlogPreviewPost[]>(
          await fetch(`${portfolioApiUrl}/api/v1/blog/posts`, {
            credentials: "include",
            cache: "no-store",
          }),
        );
        if (!cancelled) setPosts(list.slice(0, 2));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.classList.add("blog-preview-can-reveal");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("blog-preview-revealed");
        observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="blog-preview-section anchor-section"
      id="blog"
      aria-labelledby="blog-preview-title"
      data-scroll-reveal
      data-scroll-progress="blog"
    >
      <div className="blog-preview-inner">
        <header className="blog-preview-heading" data-scroll-reveal>
          <p className="eyebrow">Journal</p>
          <LusterTitle id="blog-preview-title">Latest Articles</LusterTitle>
          <p>
            Recent notes on software, product thinking, cloud, mobile, and AI.
          </p>
        </header>

        {loading ? (
          <div className="blog-preview-grid" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonCard
                className="blog-preview-skeleton-card"
                key={`blog-preview-skeleton-${index}`}
              />
            ))}
          </div>
        ) : error ? (
          <p className="blog-preview-status">
            Articles are temporarily unavailable.
          </p>
        ) : posts.length === 0 ? (
          <p className="blog-preview-status">No articles published yet.</p>
        ) : (
          <div className="blog-preview-grid">
            {posts.map((post, index) => (
              <article
                className="blog-preview-card"
                key={post.id}
                data-scroll-reveal
                style={
                  {
                    "--blog-preview-index": index,
                  } as CSSProperties
                }
              >
                {post.imageUrl ? (
                  <Link
                    className="blog-preview-image"
                    href={`/blog/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      fill
                      sizes="(max-width: 900px) calc(100vw - 2rem), 520px"
                    />
                  </Link>
                ) : null}

                <header className="blog-preview-card-header">
                  <p className="eyebrow">
                    Article {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                </header>

                <p className="blog-preview-description">{post.excerpt}</p>

                <footer className="blog-preview-meta">
                  <time dateTime={post.publishedAt ?? post.updatedAt}>
                    {formattedDate(post.publishedAt ?? post.updatedAt)}
                  </time>
                  <span>
                    <MessageSquareText aria-hidden="true" />
                    {post.commentCount}
                  </span>
                  <Link href={`/blog/${post.slug}`}>
                    Read article <ArrowUpRight aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        )}

        <Link
          className="projects-github-link blog-preview-all-link"
          href="/blog"
          aria-label="View all blog articles"
        >
          <MessageSquareText aria-hidden="true" />
          <span>View all articles</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
