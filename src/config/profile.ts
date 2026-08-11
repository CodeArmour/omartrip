export type PortfolioProfile = {
  fullName: string;
  role: string;
  location: string;
  heroEyebrow: string;
  heroSupporting: string;
  aboutBio: string;
  services: string;
  portraitUrl: string;
  portraitPublicId?: string;
  openToCollaboration: boolean;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
};

export const fallbackProfile: PortfolioProfile = {
  fullName: "Omar Abusahmoud",
  role: "Software Engineer",
  location: "Brussels, Belgium",
  heroEyebrow: "Software Developer · Brussels",
  heroSupporting:
    "I build thoughtful web, mobile, cloud and AI solutions that turn ideas into reliable digital products.",
  aboutBio:
    "I am a software engineer who enjoys turning complex ideas into dependable digital products, from thoughtful interfaces to robust backend systems.",
  services:
    "Web development, mobile applications, custom software, cloud/DevOps and AI solutions.",
  portraitUrl: "/hero-omar.png",
  openToCollaboration: true,
  email: "omarcode.business@gmail.com",
  githubUrl: "https://github.com/CodeArmour",
  linkedinUrl: "https://www.linkedin.com/in/omar-maysara-2622b0330/",
};
