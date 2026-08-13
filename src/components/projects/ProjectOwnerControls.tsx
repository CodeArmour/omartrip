"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type { Project } from "./projectsData";

type Props = {
  project: Project;
  index: number;
  total: number;
  busy: boolean;
  onEdit: () => void;
  onMove: (offset: -1 | 1) => void;
  onPublication: () => void;
  onCopyReviewLink: () => void;
  onDelete: () => void;
};

export function ProjectOwnerControls({
  project,
  index,
  total,
  busy,
  onEdit,
  onMove,
  onPublication,
  onCopyReviewLink,
  onDelete,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div
      className="project-owner-controls"
      aria-label={`Manage ${project.title}`}
    >
      <span className="project-owner-status">
        {project.published === false ? "Draft" : "Published"}
      </span>
      <button
        type="button"
        className="project-owner-action project-owner-action-primary"
        disabled={busy}
        onClick={onEdit}
      >
        <Pencil aria-hidden="true" /> Edit
      </button>
      <button
        type="button"
        className="project-owner-action project-owner-action-icon"
        aria-label={`Move ${project.title} up`}
        disabled={busy || index === 0}
        onClick={() => onMove(-1)}
      >
        <ArrowUp aria-hidden="true" />
      </button>
      <button
        type="button"
        className="project-owner-action project-owner-action-icon"
        aria-label={`Move ${project.title} down`}
        disabled={busy || index === total - 1}
        onClick={() => onMove(1)}
      >
        <ArrowDown aria-hidden="true" />
      </button>
      <button
        type="button"
        className="project-owner-action project-owner-action-primary"
        disabled={busy}
        onClick={onPublication}
      >
        {project.published === false ? (
          <Eye aria-hidden="true" />
        ) : (
          <EyeOff aria-hidden="true" />
        )}
        {project.published === false ? "Publish" : "Unpublish"}
      </button>
      <button
        type="button"
        className="project-owner-action project-owner-action-copy"
        disabled={busy}
        onClick={onCopyReviewLink}
      >
        <Copy aria-hidden="true" /> Copy review link
      </button>
      <button
        type="button"
        className={`project-owner-action project-owner-action-danger${
          confirmingDelete ? " is-confirming" : ""
        }`}
        disabled={busy}
        onBlur={() => setConfirmingDelete(false)}
        onClick={() => {
          if (confirmingDelete) onDelete();
          else setConfirmingDelete(true);
        }}
      >
        <Trash2 aria-hidden="true" />
        {confirmingDelete ? "Confirm delete" : "Delete"}
      </button>
    </div>
  );
}
