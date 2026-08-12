import { Award, Link2, MessageSquareText, type LucideIcon } from "lucide-react";

export type ExploreItem = {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  icon: LucideIcon;
  status: "available" | "coming-soon";
  accent: "guestbook" | "achievements" | "links";
};

export const exploreItems: ExploreItem[] = [
  {
    title: "Guestbook",
    description: "Leave your mark and see what others have to say.",
    href: "/guestbook",
    icon: MessageSquareText,
    status: "available",
    accent: "guestbook",
  },
  {
    title: "Achievements",
    description: "Milestones, certifications, and accomplishments.",
    icon: Award,
    status: "coming-soon",
    accent: "achievements",
  },
  {
    title: "My Links",
    description: "Find me across the web and social platforms.",
    href: "/links",
    icon: Link2,
    status: "available",
    accent: "links",
  },
];
