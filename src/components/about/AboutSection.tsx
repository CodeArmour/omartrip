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

  const activeImage = previewImage ?? defaultAboutImage;

  return (
    <section
      id="about"
      className="about-section anchor-section"
      aria-label="About Omar Abusahmoud"
    >
      <div className="about-grid">
        <IdentityCard />
        <ExperienceCards
          activeId={activeExperience}
          onActivate={activateExperience}
          onDeactivate={deactivateExperience}
          onPreview={() => showPreview(aboutPreviewImages.experience)}
        />
        <MindsetCard
          selectedId={selectedMindset}
          onSelect={setSelectedMindset}
          onPreviewStart={() => showPreview(aboutPreviewImages.mindset)}
          onPreviewEnd={hidePreview}
        />
        <div className="about-visual-column">
          <DynamicAboutImage
            image={activeImage}
            reducedMotion={reducedMotion}
          />
          <LocationCard
            onPreviewStart={() => showPreview(aboutPreviewImages.brussels)}
            onPreviewEnd={hidePreview}
          />
        </div>
        <CraftCard
          onPreviewStart={() => showPreview(aboutPreviewImages.craft)}
          onPreviewEnd={hidePreview}
        />
      </div>
    </section>
  );
}
