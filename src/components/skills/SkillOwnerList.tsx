"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Skill } from "./skillsData";

type Props = {
  skills: Skill[];
  busy: boolean;
  onEdit: (skill: Skill) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onPublication: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
};

function SkillOwnerRow({
  skill,
  index,
  total,
  busy,
  onEdit,
  onMove,
  onPublication,
  onDelete,
}: {
  skill: Skill;
  index: number;
  total: number;
  busy: boolean;
  onEdit: () => void;
  onMove: (offset: -1 | 1) => void;
  onPublication: () => void;
  onDelete: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const managed = Boolean(skill.id);

  return (
    <li>
      <div className="skill-owner-identity">
        <span className="skill-owner-logo">
          <Image src={skill.logo} alt="" width={32} height={32} sizes="32px" />
        </span>
        <span>
          <strong>{skill.name}</strong>
          <small>{skill.category || "Uncategorized"}</small>
        </span>
        <em>{skill.published === false ? "Draft" : "Published"}</em>
      </div>
      <div className="skill-owner-actions" aria-label={`Manage ${skill.name}`}>
        <button type="button" disabled={busy || !managed} onClick={onEdit}>
          <Pencil aria-hidden="true" /> Edit
        </button>
        <button
          type="button"
          aria-label={`Move ${skill.name} up`}
          disabled={busy || !managed || index === 0}
          onClick={() => onMove(-1)}
        >
          <ArrowUp aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Move ${skill.name} down`}
          disabled={busy || !managed || index === total - 1}
          onClick={() => onMove(1)}
        >
          <ArrowDown aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={busy || !managed}
          onClick={onPublication}
        >
          {skill.published === false ? (
            <Eye aria-hidden="true" />
          ) : (
            <EyeOff aria-hidden="true" />
          )}
          {skill.published === false ? "Publish" : "Unpublish"}
        </button>
        <button
          type="button"
          className={confirmingDelete ? "is-confirming" : undefined}
          disabled={busy || !managed}
          onBlur={() => setConfirmingDelete(false)}
          onClick={() => {
            if (confirmingDelete) onDelete();
            else setConfirmingDelete(true);
          }}
        >
          <Trash2 aria-hidden="true" />
          {confirmingDelete ? "Confirm" : "Delete"}
        </button>
      </div>
    </li>
  );
}

export function SkillOwnerList({
  skills,
  busy,
  onEdit,
  onMove,
  onPublication,
  onDelete,
}: Props) {
  return (
    <ul className="skill-owner-list" aria-label="Portfolio skills">
      {skills.map((skill, index) => (
        <SkillOwnerRow
          key={skill.id ?? skill.name}
          skill={skill}
          index={index}
          total={skills.length}
          busy={busy}
          onEdit={() => onEdit(skill)}
          onMove={(offset) => onMove(index, offset)}
          onPublication={() => onPublication(skill)}
          onDelete={() => onDelete(skill)}
        />
      ))}
    </ul>
  );
}
