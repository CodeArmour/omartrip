import Image from "next/image";

import type { Skill } from "./skillsData";

type SkillsFallbackGridProps = {
  skills: Skill[];
  className?: string;
};

export function SkillsFallbackGrid({
  skills,
  className = "skills-fallback-grid",
}: SkillsFallbackGridProps) {
  return (
    <ul className={className} aria-label="Technology skills">
      {skills.map((skill) => (
        <li key={skill.name}>
          <Image src={skill.logo} alt="" width={38} height={38} unoptimized />
          <span>{skill.name}</span>
        </li>
      ))}
    </ul>
  );
}
