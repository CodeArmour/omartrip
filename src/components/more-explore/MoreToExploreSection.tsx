"use client";

import { useEffect, useRef } from "react";

import { ExploreCard } from "./ExploreCard";
import { exploreItems } from "./exploreData";
import { LusterTitle } from "@/components/ui/LusterTitle";

export function MoreToExploreSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.classList.add("explore-can-reveal");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("explore-revealed");
        observer.disconnect();
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="other"
      className="more-explore-section anchor-section"
      aria-labelledby="more-explore-title"
      data-scroll-reveal
      data-scroll-progress="other"
    >
      <header className="more-explore-heading" data-scroll-reveal>
        <p className="eyebrow">More</p>
        <LusterTitle id="more-explore-title">More to Explore</LusterTitle>
        <p>Check out these additional resources and connect with me.</p>
      </header>

      <div className="explore-grid">
        {exploreItems.map((item, index) => (
          <ExploreCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
