import type { Project } from "./projectsData";
import { ProjectTags } from "./ProjectTags";
import { ProjectVisual } from "./ProjectVisual";

type ProjectCardProps = {
  project: Project;
  index: number;
  ownerControls?: React.ReactNode;
};

export function ProjectCard({
  project,
  index,
  ownerControls,
}: ProjectCardProps) {
  return (
    <article
      className="project-entry"
      data-scroll-reveal
      data-scroll-delay={index + 1}
      style={{ "--project-index": index } as React.CSSProperties}
    >
      <header className="project-entry-heading">
        <div className="project-meta">
          <span>{project.category}</span>
        </div>
        <h3 aria-label={project.title}>
          {project.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
      </header>

      {ownerControls}

      <ProjectVisual project={project} />
      <ProjectTags technologies={project.technologies} />
    </article>
  );
}
