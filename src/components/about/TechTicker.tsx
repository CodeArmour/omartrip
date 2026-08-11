import { technologies } from "./aboutData";

function TechnologyList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined}>
      {technologies.map(({ label, icon: Icon }) => (
        <li key={label}>
          <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export function TechTicker() {
  return (
    <div className="tech-ticker" tabIndex={0} aria-label="Technology stack">
      <div className="tech-ticker-track">
        <TechnologyList />
        <TechnologyList hidden />
      </div>
    </div>
  );
}
