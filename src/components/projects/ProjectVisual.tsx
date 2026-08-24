"use client";

import {
  ArrowUpRight,
  CodeXml,
  MessageSquareText,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Project } from "./projectsData";
import { useCardTilt } from "./useCardTilt";

type ProjectVisualProps = {
  project: Project;
};

export function ProjectVisual({ project }: ProjectVisualProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReviewDialogClosing, setIsReviewDialogClosing] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const readMoreButtonRef = useRef<HTMLButtonElement>(null);
  const closeDialogButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  useCardTilt(visualRef);

  const reviewText = project.customerReview.review.trim();
  const shouldClampReview = reviewText.length > 150;

  const setReviewVisible = (visible: boolean) => {
    setIsFlipped(visible);
    visualRef.current?.focus({ preventScroll: true });
  };

  const openReviewDialog = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsReviewDialogClosing(false);
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = useCallback(() => {
    setIsReviewDialogClosing(true);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsReviewDialogOpen(false);
      setIsReviewDialogClosing(false);
      closeTimerRef.current = null;
      readMoreButtonRef.current?.focus({ preventScroll: true });
    }, 220);
  }, []);

  useEffect(() => {
    if (!isReviewDialogOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReviewDialogOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isReviewDialogOpen) {
      return;
    }

    closeDialogButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeReviewDialog();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeDialogButtonRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeReviewDialog, isReviewDialogOpen]);

  const reviewDialog = isReviewDialogOpen
    ? createPortal(
        <div
          className={`project-review-dialog-layer${
            isReviewDialogClosing ? " is-closing" : ""
          }`}
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReviewDialog();
            }
          }}
        >
          <section
            ref={dialogRef}
            className="project-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
          >
            <header className="project-review-dialog-header">
              <div className="project-review-dialog-profile">
                <div className="project-review-dialog-photo">
                  <Image
                    src={project.customerReview.customerPhoto}
                    alt={project.customerReview.customerPhotoAlt}
                    fill
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="eyebrow">Full customer review</p>
                  <h4 id={dialogTitleId}>
                    {project.customerReview.customerName}
                  </h4>
                </div>
              </div>
              <button
                ref={closeDialogButtonRef}
                className="project-review-dialog-close"
                type="button"
                aria-label="Close full customer review"
                onClick={closeReviewDialog}
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <div className="project-review-dialog-body">
              <div
                className="project-review-dialog-rating"
                aria-label={`${project.customerReview.rating.toFixed(1)} out of 5 stars`}
              >
                <div className="project-review-dialog-stars" aria-hidden="true">
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
                <strong>
                  {project.customerReview.rating.toFixed(1)} / 5.0
                </strong>
              </div>

              <blockquote id={dialogDescriptionId}>{reviewText}</blockquote>
            </div>
          </section>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
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

            <div className="project-review-copy">
              <blockquote className={shouldClampReview ? "is-clamped" : ""}>
                {reviewText}
              </blockquote>
              {shouldClampReview ? (
                <button
                  ref={readMoreButtonRef}
                  className="project-review-read-more"
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`Read full review from ${project.customerReview.customerName}`}
                  tabIndex={isFlipped ? 0 : -1}
                  onClick={openReviewDialog}
                >
                  <span aria-hidden="true">... </span>Read more
                </button>
              ) : null}
            </div>

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

      {reviewDialog}
    </>
  );
}
