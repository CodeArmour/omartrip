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
  displayOrder?: number;
  published?: boolean;
};

// Keep project-specific copy and metadata here so final details can be edited
// without changing the presentation components.
export const projects: Project[] = [
  {
    number: "01",
    title: "Moon Glow Travel Agent",
    titleLines: ["Moon Glow", "Travel Agent"],
    category: "Travel website",
    description:
      "An editorial travel experience designed to help visitors discover destinations and begin planning a tailored journey.",
    image: "/projects/project1.png",
    imageAlt:
      "Moon Glow Travel Agent website showing curated destinations in Egypt, Saudi Arabia, Qatar and Dubai",
    imageWidth: 1393,
    imageHeight: 967,
    imagePosition: "center top",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://moon-two-flame.vercel.app/",
    tone: "lime",
    customerReview: {
      customerName: "Moon Glow Team",
      customerPhoto: "/projects/project1.png",
      customerPhotoAlt: "Moon Glow Travel Agent brand preview",
      rating: 5,
      review:
        "Omar translated our travel concept into a clear, polished experience that feels inviting and makes destinations easy to explore.",
    },
  },
  {
    number: "02",
    title: "Andalucia Engineering Consulting",
    titleLines: ["Andalucia Engineering", "Consulting"],
    category: "Corporate website",
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
  },
];
