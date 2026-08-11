"use client";

import {
  ArrowUpRight,
  CodeXml,
  MessageSquareText,
  RotateCcw,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { Project } from "./projectsData";
import { useCardTilt } from "./useCardTilt";

type ProjectVisualProps = {
  project: Project;
};

export function ProjectVisual({ project }: ProjectVisualProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);
  useCardTilt(visualRef);

  const setReviewVisible = (visible: boolean) => {
    setIsFlipped(visible);
    visualRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={visualRef}
      className={`project-visual${isFlipped ? " is-flipped" : ""}`}
      data-tone={project.tone}
      tabIndex={0}
      aria-label={`${project.title} ${isFlipped ? "customer review" : "project preview"}`}
    >
      <div className="project-visual-spotlight" aria-hidden="true" />

      <div className="project-flip-inner">
        <section
          className="project-visual-face project-visual-front"
          aria-hidden={isFlipped}
        >
          <p>{project.description}</p>

          <div className="project-hover-actions">
            {project.liveUrl ? (
              <a
                className="project-view-link"
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`View ${project.title} live project`}
                tabIndex={isFlipped ? -1 : 0}
              >
                <CodeXml aria-hidden="true" />
                <span>View</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
            <button
              className="project-review-button"
              type="button"
              aria-label={`Show customer review for ${project.title}`}
              aria-pressed={isFlipped}
              tabIndex={isFlipped ? -1 : 0}
              onClick={() => setReviewVisible(true)}
            >
              <MessageSquareText aria-hidden="true" />
              <span>Review</span>
            </button>
          </div>

          <div
            className="project-image-frame"
            style={{
              aspectRatio: `${project.imageWidth} / ${project.imageHeight}`,
            }}
          >
            <div className="project-frame-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>Selected interface</span>
            </div>
            <div className="project-image-viewport">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 820px) calc(100vw - 40px), (max-width: 1440px) 44vw, 600px"
                style={{ objectPosition: project.imagePosition }}
              />
            </div>
          </div>
        </section>

        <section
          className="project-visual-face project-review-face"
          aria-hidden={!isFlipped}
          aria-label={`${project.customerReview.customerName} review`}
        >
          <div className="project-review-profile">
            <div className="project-review-photo">
              <Image
                src={project.customerReview.customerPhoto}
                alt={project.customerReview.customerPhotoAlt}
                fill
                sizes="72px"
              />
            </div>
            <div>
              <p className="eyebrow">Customer review</p>
              <h4>{project.customerReview.customerName}</h4>
            </div>
          </div>

          <div
            className="project-review-rating"
            aria-label={`${project.customerReview.rating.toFixed(1)} out of 5 stars`}
          >
            <strong>{project.customerReview.rating.toFixed(1)}</strong>
            <span aria-hidden="true">/ 5.0</span>
            <div className="project-review-stars" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={
                    index + 1 <= Math.round(project.customerReview.rating)
                      ? "is-filled"
                      : undefined
                  }
                />
              ))}
            </div>
          </div>

          <blockquote>{project.customerReview.review}</blockquote>

          <button
            className="project-review-back"
            type="button"
            aria-label={`Return to ${project.title} project details`}
            aria-pressed={isFlipped}
            tabIndex={isFlipped ? 0 : -1}
            onClick={() => setReviewVisible(false)}
          >
            <RotateCcw aria-hidden="true" />
            <span>Back to project</span>
          </button>
        </section>
      </div>
    </div>
  );
}
