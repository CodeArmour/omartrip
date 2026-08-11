export const navigationItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Other", id: "other" },
] as const;

export type NavigationId = (typeof navigationItems)[number]["id"];
