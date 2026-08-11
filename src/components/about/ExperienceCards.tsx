import { experiences, type ExperienceItem } from "./aboutData";

type ExperienceCardsProps = {
  activeId: ExperienceItem["id"] | null;
  onActivate: (id: ExperienceItem["id"]) => void;
  onDeactivate: () => void;
  onPreview: () => void;
};

export function ExperienceCards({
  activeId,
  onActivate,
  onDeactivate,
  onPreview,
}: ExperienceCardsProps) {
  return (
    <article
      className="about-card experience-group"
      onMouseEnter={onPreview}
      onMouseLeave={onDeactivate}
      onFocus={onPreview}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onDeactivate();
      }}
    >
      <p className="experience-hint">Hover or focus to read more</p>
      <div className="experience-stack">
        {experiences.map((experience, index) => {
          const isActive = activeId === experience.id;
          return (
            <button
              key={experience.id}
              type="button"
              className="experience-card"
              data-active={isActive || undefined}
              data-dimmed={activeId !== null && !isActive ? true : undefined}
              onMouseEnter={() => onActivate(experience.id)}
              onFocus={() => onActivate(experience.id)}
              onClick={() => onActivate(experience.id)}
              aria-pressed={isActive}
              aria-label={`${experience.title}: ${experience.description}`}
              style={{ "--experience-index": index } as React.CSSProperties}
            >
              <span className="experience-number">0{index + 1}</span>
              <span className="experience-title">{experience.title}</span>
              <span className="experience-description">
                {experience.description}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
