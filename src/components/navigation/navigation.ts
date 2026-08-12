export const navigationItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Blog", id: "blog" },
  { label: "Other", id: "other" },
] as const;

export type NavigationItem = (typeof navigationItems)[number];
export type NavigationId = NavigationItem["id"];
