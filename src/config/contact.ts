export type ContactDetails = {
  email: string;
  bookingUrl?: string;
  githubUrl: string;
  linkedinUrl: string;
};

export const contactDetails: ContactDetails = {
  email: "omarcode.business@gmail.com",
  githubUrl: "https://github.com/CodeArmour",
  linkedinUrl: "https://www.linkedin.com/in/omar-maysara-2622b0330/",
};

export const contactEmailHref = `mailto:${contactDetails.email}`;
export const projectInquiryEmailHref = `${contactEmailHref}?subject=Project%20inquiry%20from%20your%20portfolio`;
