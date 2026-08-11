export type Skill = {
  id?: string;
  name: string;
  logo: string;
  logoPublicId?: string;
  category?: string;
  displayOrder?: number;
  published?: boolean;
};

export const skills: Skill[] = [
  { name: "Apache", logo: "/skills/Apache.svg" },
  { name: "Figma", logo: "/skills/Figma.svg" },
  { name: "Git", logo: "/skills/Git.svg" },
  { name: "GitHub", logo: "/skills/GitHub.svg" },
  { name: "GitLab", logo: "/skills/GitLab.svg" },
  { name: "Java", logo: "/skills/Java.svg" },
  { name: "JavaScript", logo: "/skills/JavaScript.svg" },
  { name: "Jest", logo: "/skills/Jest.svg" },
  { name: "JetBrains", logo: "/skills/JetBrains.svg" },
  { name: "MongoDB", logo: "/skills/MongoDB.svg" },
  { name: "MySQL", logo: "/skills/MySQL.svg" },
  { name: "Nest.js", logo: "/skills/Nest.js.svg" },
  { name: "Next.js", logo: "/skills/Next.js.svg" },
  { name: "Node.js", logo: "/skills/Node.js.svg" },
  { name: "PHP", logo: "/skills/PHP.svg" },
  { name: "PostgreSQL", logo: "/skills/PostgresSQL.svg" },
  { name: "React", logo: "/skills/React.svg" },
  { name: "Spring", logo: "/skills/Spring.svg" },
  { name: "Swagger", logo: "/skills/Swagger.svg" },
  { name: "Tailwind CSS", logo: "/skills/Tailwind CSS.svg" },
  { name: "TypeScript", logo: "/skills/TypeScript.svg" },
];
