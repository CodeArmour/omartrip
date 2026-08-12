import type { Metadata } from "next";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

const rawBackendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8081";

export const siteUrl = rawSiteUrl.replace(/\/$/, "");
export const backendUrl = rawBackendUrl.replace(/\/$/, "");

export const defaultSeo = {
  title: "Omar Abusahmoud — Software Developer",
  description:
    "Software Engineer in Brussels building thoughtful web, mobile, cloud and AI solutions.",
  imageAlt: "Omar Abusahmoud software developer portfolio preview",
};

export function absoluteSiteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteImageUrl(path?: string | null) {
  if (!path) return absoluteSiteUrl("/opengraph-image");
  if (/^https?:\/\//i.test(path)) return path;
  return absoluteSiteUrl(path);
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  imageAlt?: string;
  robots?: Metadata["robots"];
  referrer?: Metadata["referrer"];
}): Metadata {
  const url = absoluteSiteUrl(input.path ?? "/");
  const imageUrl = absoluteImageUrl(input.image);
  const imageAlt = input.imageAlt ?? defaultSeo.imageAlt;

  return {
    title: input.title,
    description: input.description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    robots: input.robots,
    referrer: input.referrer,
    openGraph: {
      type: "website",
      siteName: "Omar Abusahmoud",
      title: input.title,
      description: input.description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
  };
}

export type BlogPostSeo = {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type ReviewInvitationSeo = {
  projectTitle: string;
  projectCategory: string;
  projectImage?: string | null;
};

export async function getBlogPostSeo(slug: string) {
  try {
    const response = await fetch(
      `${backendUrl}/api/v1/blog/posts/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return (await response.json()) as BlogPostSeo;
  } catch {
    return null;
  }
}

export async function getReviewInvitationSeo(token: string) {
  try {
    const response = await fetch(
      `${backendUrl}/api/v1/projects/reviews/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return (await response.json()) as ReviewInvitationSeo;
  } catch {
    return null;
  }
}
