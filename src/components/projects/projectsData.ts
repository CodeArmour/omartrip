export type ProjectReview = {
  customerName: string;
  customerPhoto: string;
  customerPhotoAlt: string;
  rating: number;
  review: string;
};

export type Project = {
  id?: string;
  number: string;
  slug: string;
  title: string;
  titleLines: readonly [string, string];
  category: string;
  description: string;
  image: string;
  imagePublicId?: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition: string;
  technologies: string[];
  liveUrl?: string;
  repositoryUrl?: string;
  tone: "lime" | "cream";
  customerReview: ProjectReview;
  caseStudy: ProjectCaseStudy;
  displayOrder?: number;
  published?: boolean;
};

export type ProjectCaseStudy = {
  problem: string;
  solution: string;
  result: string;
};

export function projectSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function projectPath(project: Pick<Project, "slug" | "title">) {
  return `/projects/${project.slug || projectSlug(project.title)}`;
}

const caseStudies: Record<string, ProjectCaseStudy> = {
  "andalucia-engineering-consulting": {
    problem:
      "Andalucia needed a sharper digital presence for a technical consultancy. The old experience did not make the firm's engineering authority, service areas, and credibility clear enough for new visitors.",
    solution:
      "I structured the site around a clearer consulting story, direct service messaging, and a polished visual system that feels professional without becoming heavy. The interface gives visitors a faster path from first impression to understanding what the company does.",
    result:
      "The final website presents the company with more confidence, makes the consultancy offer easier to scan, and supports a more premium first impression for prospective clients and partners.",
  },
  "moon-glow-travel": {
    problem:
      "Moon Glow needed a travel website that could make destinations feel curated and easy to explore, while still guiding visitors toward the next step in planning a trip.",
    solution:
      "I built an editorial destination experience with strong imagery, organized destination cards, and a cleaner browsing flow. The design keeps the travel feeling aspirational while making the content practical and easy to navigate.",
    result:
      "The site gives Moon Glow a more polished travel presence, helps visitors understand available destinations quickly, and creates a clearer path from inspiration to inquiry.",
  },
};

export function projectCaseStudy(title: string, slug = projectSlug(title)) {
  return (
    caseStudies[slug] ?? {
      problem:
        "The project needed a clearer digital experience that could communicate the offer quickly and feel credible from the first visit.",
      solution:
        "I shaped the interface around focused messaging, responsive layouts, and a visual system tailored to the project's audience and goals.",
      result:
        "The result is a more polished, easier-to-use web presence that helps visitors understand the work and move toward the intended action.",
    }
  );
}

// Keep project-specific copy and metadata here so final details can be edited
// without changing the presentation components.
export const projects: Project[] = [
  {
    number: "01",
    slug: "andalucia-engineering-consulting",
    title: "Andalucia Engineering Consulting",
    titleLines: ["Andalucia Engineering", "Consulting"],
    category: "Engineering · Website",
    description:
      "A confident corporate presence that organizes consultancy services, industries and project expertise into a clear digital introduction.",
    image: "/projects/project2.png",
    imageAlt:
      "Andalucia Engineering Consulting website with engineering consultancy introduction",
    imageWidth: 1730,
    imageHeight: 942,
    imagePosition: "center top",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://www.andaluciagroup.eu/",
    tone: "cream",
    customerReview: {
      customerName: "Andalucia Group",
      customerPhoto: "/projects/project2.png",
      customerPhotoAlt: "Andalucia Engineering Consulting brand preview",
      rating: 5,
      review:
        "The new website presents our engineering services with confidence and gives visitors a much clearer path through our expertise.",
    },
    caseStudy: caseStudies["andalucia-engineering-consulting"],
  },
  {
    number: "02",
    slug: "moon-glow-travel",
    title: "Moon Glow Travel",
    titleLines: ["Moon Glow", "Travel"],
    category: "Travel · Website",
    description:
      "An editorial travel experience designed to help visitors discover destinations and begin planning a tailored journey.",
    image: "/projects/project1.png",
    imageAlt:
      "Moon Glow Travel website showing curated destinations in Egypt, Saudi Arabia, Qatar and Dubai",
    imageWidth: 1393,
    imageHeight: 967,
    imagePosition: "center top",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://moon-two-flame.vercel.app/",
    tone: "lime",
    customerReview: {
      customerName: "Moon Glow Team",
      customerPhoto: "/projects/project1.png",
      customerPhotoAlt: "Moon Glow Travel brand preview",
      rating: 5,
      review:
        "Omar translated our travel concept into a clear, polished experience that feels inviting and makes destinations easy to explore.",
    },
    caseStudy: caseStudies["moon-glow-travel"],
  },
];
