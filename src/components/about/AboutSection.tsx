"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  aboutPreviewImages,
  defaultAboutImage,
  mindsetItems,
  type AboutImage,
  type ExperienceItem,
} from "./aboutData";
import { CraftCard } from "./CraftCard";
import { DynamicAboutImage } from "./DynamicAboutImage";
import { ExperienceCards } from "./ExperienceCards";
import { IdentityCard } from "./IdentityCard";
import { LocationCard } from "./LocationCard";
import { MindsetCard } from "./MindsetCard";

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeExperience, setActiveExperience] = useState<
    ExperienceItem["id"] | null
  >(null);
  const [previewImage, setPreviewImage] = useState<AboutImage | null>(null);
  const [selectedMindset, setSelectedMindset] = useState(mindsetItems[0].id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const previewResetTimer = useRef<number | null>(null);
  const experienceResetTimer = useRef<number | null>(null);

  const showPreview = useCallback((image: AboutImage) => {
    if (previewResetTimer.current !== null)
      window.clearTimeout(previewResetTimer.current);
    setPreviewImage(image);
  }, []);

  const hidePreview = useCallback(() => {
    if (previewResetTimer.current !== null)
      window.clearTimeout(previewResetTimer.current);
    previewResetTimer.current = window.setTimeout(
      () => setPreviewImage(null),
      160,
    );
  }, []);

  const activateExperience = useCallback((id: ExperienceItem["id"]) => {
    if (experienceResetTimer.current !== null)
      window.clearTimeout(experienceResetTimer.current);
    setActiveExperience(id);
  }, []);

  const deactivateExperience = useCallback(() => {
    if (experienceResetTimer.current !== null)
      window.clearTimeout(experienceResetTimer.current);
    experienceResetTimer.current = window.setTimeout(
      () => setActiveExperience(null),
      420,
    );
    hidePreview();
  }, [hidePreview]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    [defaultAboutImage, ...Object.values(aboutPreviewImages)].forEach(
      ({ src }) => {
        const image = new window.Image();
        image.src = src;
      },
    );
    return () => {
      if (previewResetTimer.current !== null)
        window.clearTimeout(previewResetTimer.current);
      if (experienceResetTimer.current !== null)
        window.clearTimeout(experienceResetTimer.current);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>("[data-about-card]"),
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const origins = {
      left: { x: -46, y: 4.5, rotate: -7 },
      right: { x: 46, y: 4.5, rotate: 7 },
      center: { x: 0, y: 2.5, rotate: 0 },
    } as const;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const updateCards = (progress: number) => {
      const eased = 1 - Math.pow(1 - progress, 3);
      const hidden = 1 - eased;
      section.style.setProperty("--about-assembly-progress", String(eased));

      cards.forEach((card) => {
        const origin =
          origins[(card.dataset.aboutOrigin as keyof typeof origins) ?? "left"];
        const x = origin.x * hidden;
        const y = origin.y * hidden;
        const rotate = origin.rotate * hidden;
        const scale = 0.94 + eased * 0.06;

        card.style.transform = `translate3d(${x}vw, ${y}rem, 0) rotate(${rotate}deg) scale(${scale})`;
        card.style.opacity = String(0.18 + eased * 0.82);
      });
    };

    const update = () => {
      frame = 0;

      if (motionQuery.matches || window.innerWidth < 900) {
        section.classList.remove("about-scroll-assembly");
        cards.forEach((card) => {
          card.style.transform = "";
          card.style.opacity = "";
        });
        return;
      }

      section.classList.add("about-scroll-assembly");
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.82;
      const end = -viewportHeight * 0.14;
      updateCards(clamp((start - rect.top) / (start - end)));
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motionQuery.addEventListener("change", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motionQuery.removeEventListener("change", schedule);
    };
  }, []);

  const activeImage = previewImage ?? defaultAboutImage;

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section anchor-section"
      aria-label="About Omar Abusahmoud"
    >
      <div className="about-grid">
        <div
          className="about-reveal-identity"
          data-about-card
          data-about-origin="left"
        >
          <IdentityCard />
        </div>
        <div
          className="about-reveal-experience"
          data-about-card
          data-about-origin="right"
        >
          <ExperienceCards
            activeId={activeExperience}
            onActivate={activateExperience}
            onDeactivate={deactivateExperience}
            onPreview={() => showPreview(aboutPreviewImages.experience)}
          />
        </div>
        <div
          className="about-reveal-mindset"
          data-about-card
          data-about-origin="left"
        >
          <MindsetCard
            selectedId={selectedMindset}
            onSelect={setSelectedMindset}
            onPreviewStart={() => showPreview(aboutPreviewImages.mindset)}
            onPreviewEnd={hidePreview}
          />
        </div>
        <div
          className="about-visual-column"
          data-about-card
          data-about-origin="center"
        >
          <DynamicAboutImage
            image={activeImage}
            reducedMotion={reducedMotion}
          />
          <LocationCard
            onPreviewStart={() => showPreview(aboutPreviewImages.brussels)}
            onPreviewEnd={hidePreview}
          />
        </div>
        <div
          className="about-reveal-craft"
          data-about-card
          data-about-origin="right"
        >
          <CraftCard
            onPreviewStart={() => showPreview(aboutPreviewImages.craft)}
            onPreviewEnd={hidePreview}
          />
        </div>
      </div>
    </section>
  );
}
