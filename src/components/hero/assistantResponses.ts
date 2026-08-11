export type AssistantTopic =
  "about" | "projects" | "skills" | "links" | "book" | null;

export type AssistantResponse = {
  message: string;
  actionLabel?: string;
  target?: AssistantTopic;
};

export function getPortfolioResponse(question: string): AssistantResponse {
  const normalizedQuestion = question.trim().toLowerCase();

  const asksForContactAdvice =
    /advice|advices|prepare|ready|before|bring|useful|productive|professional/.test(
      normalizedQuestion,
    ) &&
    /contact|call|meeting|conversation|talk to omar|speak with omar|approach omar/.test(
      normalizedQuestion,
    );

  if (asksForContactAdvice) {
    return {
      message:
        "Here's a simple way to make your conversation with Omar productive:\n1. Book a 30-minute call.\n2. Prepare a short summary of your idea and attach any useful files, designs, or examples.\n3. Note your main goals, preferred timeline, budget range, and important constraints.\n4. Write down the questions or decisions you'd like to cover.\nThat will help Omar understand your needs quickly and make the call more useful. Ready to book it?",
      actionLabel: "Book a 30-minute call",
      target: "book",
    };
  }

  if (
    /who are you|what are you|your name|introduce yourself|who is omi|what is omi/.test(
      normalizedQuestion,
    )
  ) {
    return {
      message:
        "Hey, I'm Omi, Omar's right hand and portfolio assistant 👋 I can help you get to know his work, skills, services, and experience. What are you curious about?",
    };
  }

  if (/project|portfolio|work|case study/.test(normalizedQuestion)) {
    return {
      message:
        "Omar's featured projects include Moon Glow Travel Agent and the Andalucia Engineering Consulting website, both built with Next.js, TypeScript, and Tailwind CSS. 🚀 For more details, follow the link below.",
      actionLabel: "View projects",
      target: "projects",
    };
  }

  if (
    /skill|stack|technology|frontend|backend|mobile|cloud|devops|ai/.test(
      normalizedQuestion,
    )
  ) {
    return {
      message:
        "Omar works across frontend, backend, mobile, cloud, DevOps, and AI. His toolkit includes Next.js, React, TypeScript, Java, Spring Boot, Flutter, Docker, AWS, PostgreSQL, and more. For more details, follow the link below.",
      actionLabel: "Explore skills",
      target: "skills",
    };
  }

  if (/where|location|based|brussels|belgium/.test(normalizedQuestion)) {
    return {
      message:
        "Omar is based in Brussels, Belgium, and is comfortable collaborating with teams across different locations. 📍 For more details, follow the link below.",
      actionLabel: "Explore Omar's story",
      target: "about",
    };
  }

  if (/service|offer|help|build|solution/.test(normalizedQuestion)) {
    return {
      message:
        "Omar builds web applications, mobile apps, custom software, cloud and DevOps systems, and practical AI solutions shaped around real business needs. For more details, follow the link below.",
      actionLabel: "Explore Omar's story",
      target: "about",
    };
  }

  if (
    /contact|available|availability|hire|call|email/.test(normalizedQuestion)
  ) {
    return {
      message:
        "You can reach Omar through Book a Call, email, GitHub, or LinkedIn. 📬 For more details, follow the link below.",
      actionLabel: "Open contact links",
      target: "links",
    };
  }

  if (/about|who is omar|omar/.test(normalizedQuestion)) {
    return {
      message:
        "Omar is a Software Engineer based in Brussels. He founded Miners Group, a software-services company, and graduated in Computer Science from the University of Nyiregyhaza. For more details, follow the link below.",
      actionLabel: "About Omar",
      target: "about",
    };
  }

  return {
    message:
      "I can help with Omar's projects, skills, services, location, or availability. Try asking about one of those topics.",
  };
}
