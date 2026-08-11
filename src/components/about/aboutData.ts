import {
  Braces,
  Cloud,
  Code2,
  Container,
  GitBranch,
  Layers3,
  Server,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type AboutImage = {
  src: string;
  alt: string;
  position: string;
};

export type ExperienceItem = {
  id: "miners" | "university" | "competitions";
  title: string;
  description: string;
  image: AboutImage;
};

export type MindsetItem = AboutImage & {
  id: "training" | "balance" | "reflection";
  label: string;
};

export type TechnologyItem = {
  label: string;
  icon: LucideIcon;
};

export const defaultAboutImage: AboutImage = {
  src: "/about/me.jpeg",
  alt: "Omar Abusahmoud outdoors in warm evening light",
  position: "50% 48%",
};

export const experiences: ExperienceItem[] = [
  {
    id: "miners",
    title: "Miners Group",
    description:
      "I am the founder of Miners Group, a software services company delivering web, mobile, custom software, cloud and AI solutions around real business needs.",
    image: defaultAboutImage,
  },
  {
    id: "university",
    title: "University",
    description:
      "I graduated in Computer Science from the Faculty of Informatics at the University of Nyíregyháza, building a strong foundation in software engineering and problem-solving.",
    image: {
      src: "/about/uni.jpg",
      alt: "Omar's university campus in winter",
      position: "52% 52%",
    },
  },
  {
    id: "competitions",
    title: "Competitions",
    description:
      "Collaborative challenges that sharpen clear thinking, rapid prototyping, and confident presentation under time pressure.",
    image: {
      src: "/about/craft.jpg",
      alt: "Omar receiving recognition at the Palestinian embassy",
      position: "46% 43%",
    },
  },
];

export const aboutPreviewImages = {
  experience: experiences[1].image,
  mindset: {
    src: "/about/mindset.jpeg",
    alt: "Omar training at the gym",
    position: "50% 42%",
  },
  craft: experiences[2].image,
  brussels: {
    src: "/about/brussels.jpg",
    alt: "Grand Place in Brussels, Belgium",
    position: "50% 58%",
  },
} satisfies Record<string, AboutImage>;

export const mindsetItems: MindsetItem[] = [
  {
    id: "training",
    label: "Consistency",
    src: "/about/mindset/mindset1.jpeg",
    alt: "A fitness progress dashboard showing Omar's consistency",
    position: "50% 22%",
  },
  {
    id: "balance",
    label: "Balance",
    src: "/about/mindset/mindset2.jpeg",
    alt: "A calm Brussels park lake and fountain",
    position: "50% 44%",
  },
  {
    id: "reflection",
    label: "Reflection",
    src: "/about/mindset/mindset3.jpeg",
    alt: "Omar beside the water at dusk",
    position: "50% 52%",
  },
];

export const technologies: TechnologyItem[] = [
  { label: "Next.js", icon: Layers3 },
  { label: "React", icon: Code2 },
  { label: "TypeScript", icon: Braces },
  { label: "Java", icon: Code2 },
  { label: "Spring Boot", icon: Server },
  { label: "Node.js", icon: Server },
  { label: "Python", icon: Braces },
  { label: "Flutter", icon: Smartphone },
  { label: "Docker", icon: Container },
  { label: "AWS", icon: Cloud },
  { label: "Git", icon: GitBranch },
  { label: "AI", icon: Sparkles },
];
