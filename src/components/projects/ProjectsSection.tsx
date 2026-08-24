"use client";

import { ArrowUpRight, CodeXml, Plus, Settings2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  portfolioApiUrl,
  usePortfolioAuth,
} from "@/components/auth/PortfolioAuthProvider";
import { LusterTitle } from "@/components/ui/LusterTitle";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { contactDetails } from "@/config/contact";

import { ProjectCard } from "./ProjectCard";
import {
  ProjectOwnerEditor,
  type ProjectImageAsset,
  type ProjectInput,
} from "./ProjectOwnerEditor";
import { ProjectOwnerControls } from "./ProjectOwnerControls";
import {
  projects as fallbackProjects,
  projectCaseStudy,
  projectSlug,
  type Project,
} from "./projectsData";

type ApiProject = Omit<
  Project,
  "number" | "titleLines" | "slug" | "caseStudy"
> & {
  id: string;
  titleLines: string[];
  displayOrder: number;
  published: boolean;
};

function normalizeProjects(items: ApiProject[]): Project[] {
  return items.map((item, index) => ({
    ...item,
    slug: projectSlug(item.title),
    number: String(index + 1).padStart(2, "0"),
    titleLines: [item.titleLines[0] ?? item.title, item.titleLines[1] ?? ""],
    caseStudy: projectCaseStudy(item.title),
  }));
}

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { session, csrfHeaders } = usePortfolioAuth();
  const [projectItems, setProjectItems] = useState<Project[]>(fallbackProjects);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadProjects = useCallback(async () => {
    const endpoint = session.admin
      ? "/api/v1/projects/admin"
      : "/api/v1/projects";
    try {
      const response = await fetch(`${portfolioApiUrl}${endpoint}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      const loaded = normalizeProjects((await response.json()) as ApiProject[]);
      if (loaded.length > 0 || session.admin) setProjectItems(loaded);
    } catch {
      if (!session.admin) setProjectItems(fallbackProjects);
      setFeedback(
        session.admin ? "Project management is temporarily unavailable." : "",
      );
    } finally {
      setLoading(false);
    }
  }, [session.admin]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProjects(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.classList.add("projects-can-reveal");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("projects-revealed");
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  async function ownerRequest(path: string, init: RequestInit) {
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch(`${portfolioApiUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(await csrfHeaders()),
          ...init.headers,
        },
      });
      if (!response.ok) {
        const details = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(
          details?.message ?? "The project could not be updated.",
        );
      }
      await loadProjects();
      return true;
    } catch (reason) {
      setFeedback(
        reason instanceof Error
          ? reason.message
          : "The project could not be updated.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveProject(input: ProjectInput) {
    const path = editingProject?.id
      ? `/api/v1/projects/admin/${editingProject.id}`
      : "/api/v1/projects/admin";
    const saved = await ownerRequest(path, {
      method: editingProject?.id ? "PUT" : "POST",
      body: JSON.stringify(input),
    });
    if (saved) {
      setEditorOpen(false);
      setEditingProject(null);
      setFeedback(editingProject ? "Project updated." : "Project added.");
    }
  }

  async function moveProject(index: number, offset: -1 | 1) {
    const reordered = [...projectItems];
    [reordered[index], reordered[index + offset]] = [
      reordered[index + offset],
      reordered[index],
    ];
    const ids = reordered.map((project) => project.id).filter(Boolean);
    if (ids.length !== reordered.length) return;
    await ownerRequest("/api/v1/projects/admin/reorder", {
      method: "PATCH",
      body: JSON.stringify({ projectIds: ids }),
    });
  }

  async function copyReviewLink(project: Project) {
    if (!project.id) return;
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/projects/admin/${project.id}/review-invitations`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(await csrfHeaders()),
          },
        },
      );
      if (!response.ok)
        throw new Error("The review link could not be created.");
      const invitation = (await response.json()) as { token: string };
      const url = `${window.location.origin}/review/${invitation.token}`;
      await navigator.clipboard.writeText(url);
      setFeedback(`Review link for ${project.title} copied to your clipboard.`);
    } catch (reason) {
      setFeedback(
        reason instanceof Error
          ? reason.message
          : "The review link could not be copied.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadProjectImage(file: File): Promise<ProjectImageAsset> {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(
      `${portfolioApiUrl}/api/v1/projects/admin/images`,
      {
        method: "POST",
        credentials: "include",
        headers: await csrfHeaders(),
        body,
      },
    );
    if (!response.ok) {
      const details = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(details?.message ?? "The image could not be uploaded.");
    }
    return (await response.json()) as ProjectImageAsset;
  }

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="projects-section anchor-section"
      aria-labelledby="projects-title"
      data-scroll-reveal
      data-scroll-progress="projects"
    >
      <header className="projects-heading" data-scroll-reveal>
        <p className="eyebrow">Portfolio</p>
        <LusterTitle id="projects-title">Selected Work</LusterTitle>
        <p>
          A selection of projects that reflect how I design, build and deliver
          digital products.
        </p>
      </header>

      {session.admin ? (
        <div className="projects-owner-bar" data-scroll-reveal>
          <span>
            <Settings2 aria-hidden="true" /> Owner project manager
          </span>
          <button
            type="button"
            onClick={() => {
              setEditingProject(null);
              setEditorOpen(true);
            }}
          >
            <Plus aria-hidden="true" /> Add project
          </button>
        </div>
      ) : null}

      {feedback ? (
        <p className="projects-owner-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      {session.admin && editorOpen ? (
        <ProjectOwnerEditor
          key={editingProject?.id ?? "new"}
          project={editingProject}
          busy={busy}
          onCancel={() => {
            setEditorOpen(false);
            setEditingProject(null);
          }}
          onSave={(input) => void saveProject(input)}
          onUpload={uploadProjectImage}
        />
      ) : null}

      <div className="projects-grid" aria-busy={loading}>
        {loading && session.admin
          ? Array.from({ length: 2 }).map((_, index) => (
              <SkeletonCard
                className="project-skeleton-card"
                key={`project-skeleton-${index}`}
              />
            ))
          : null}
        {(!loading || !session.admin) &&
          projectItems.map((project, index) => (
            <ProjectCard
              key={project.id ?? project.number}
              project={project}
              index={index}
              ownerControls={
                session.admin && project.id ? (
                  <ProjectOwnerControls
                    project={project}
                    index={index}
                    total={projectItems.length}
                    busy={busy}
                    onEdit={() => {
                      setEditingProject(project);
                      setEditorOpen(true);
                    }}
                    onMove={(offset) => void moveProject(index, offset)}
                    onPublication={() =>
                      void ownerRequest(
                        `/api/v1/projects/admin/${project.id}/publication?published=${project.published === false}`,
                        { method: "PATCH" },
                      )
                    }
                    onCopyReviewLink={() => void copyReviewLink(project)}
                    onDelete={() =>
                      void ownerRequest(
                        `/api/v1/projects/admin/${project.id}`,
                        {
                          method: "DELETE",
                        },
                      )
                    }
                  />
                ) : undefined
              }
            />
          ))}
      </div>

      <a
        className="projects-github-link"
        href={contactDetails.githubUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Explore more projects on Omar Abusahmoud's GitHub profile"
      >
        <CodeXml aria-hidden="true" />
        <span>Explore more projects on GitHub</span>
        <ArrowUpRight aria-hidden="true" />
      </a>
    </section>
  );
}
