type ProjectTagsProps = {
  technologies: string[];
};

export function ProjectTags({ technologies }: ProjectTagsProps) {
  if (technologies.length === 0) return null;

  return (
    <ul className="project-tags" aria-label="Project technologies">
      {technologies.map((technology) => (
        <li key={technology}>{technology}</li>
      ))}
    </ul>
  );
}
