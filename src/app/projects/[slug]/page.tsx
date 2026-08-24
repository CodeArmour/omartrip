import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DotGridBackground } from "@/components/background/DotGridBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { projectPath, projects } from "@/components/projects/projectsData";
import { buildPageMetadata } from "@/lib/seo";

type ProjectCaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectCaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) {
    return buildPageMetadata({
      title: "Project Case Study | Omar Abusahmoud",
      description: "Read a project case study from Omar Abusahmoud.",
      path: `/projects/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${project.title} Case Study | Omar Abusahmoud`,
    description: `${project.caseStudy.problem} ${project.caseStudy.result}`,
    path: projectPath(project),
    image: project.image,
    imageAlt: project.imageAlt,
  });
}

function CaseStudySection({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="case-study-panel">
      <span aria-hidden="true">
        <CheckCircle2 />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
    </section>
  );
}

export default async function ProjectCaseStudyPage({
  params,
}: ProjectCaseStudyPageProps) {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) notFound();

  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />
      <div className="site-shell">
        <main className="case-study-page">
          <Link className="case-study-back-link" href="/#projects">
            <ArrowLeft aria-hidden="true" />
            Back to selected work
          </Link>

          <article className="case-study-article">
            <header className="case-study-hero">
              <p className="eyebrow">{project.category}</p>
              <h1>{project.title}</h1>
              <p>{project.description}</p>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Visit live project
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
            </header>

            <div className="case-study-visual">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 900px) calc(100vw - 32px), 960px"
                priority
                style={{ objectPosition: project.imagePosition }}
              />
            </div>

            <div className="case-study-grid">
              <CaseStudySection
                title="Problem"
                copy={project.caseStudy.problem}
              />
              <CaseStudySection
                title="Solution"
                copy={project.caseStudy.solution}
              />
              <CaseStudySection
                title="Result"
                copy={project.caseStudy.result}
              />
            </div>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
