"use client";

import { Plus, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  portfolioApiUrl,
  usePortfolioAuth,
} from "@/components/auth/PortfolioAuthProvider";
import { LusterTitle } from "@/components/ui/LusterTitle";

import { SkillOwnerEditor, type SkillInput } from "./SkillOwnerEditor";
import { SkillOwnerList } from "./SkillOwnerList";
import { SkillSphere } from "./SkillSphere";
import { skills as fallbackSkills, type Skill } from "./skillsData";

type SkillUpload = {
  secureUrl: string;
  publicId: string;
};

export function SkillsSection() {
  const { session, csrfHeaders } = usePortfolioAuth();
  const [skillItems, setSkillItems] = useState<Skill[]>(fallbackSkills);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadSkills = useCallback(async () => {
    const endpoint = session.admin ? "/api/v1/skills/admin" : "/api/v1/skills";
    try {
      const response = await fetch(`${portfolioApiUrl}${endpoint}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      const loaded = (await response.json()) as Skill[];
      if (loaded.length > 0 || session.admin) setSkillItems(loaded);
    } catch {
      if (!session.admin) setSkillItems(fallbackSkills);
      setFeedback(
        session.admin ? "Skill management is temporarily unavailable." : "",
      );
    }
  }, [session.admin]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSkills(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSkills]);

  async function ownerRequest(path: string, init: RequestInit) {
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch(`${portfolioApiUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(await csrfHeaders()),
          ...init.headers,
        },
      });
      if (!response.ok) {
        const details = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(details?.message ?? "The skill could not be updated.");
      }
      await loadSkills();
      return true;
    } catch (reason) {
      setFeedback(
        reason instanceof Error
          ? reason.message
          : "The skill could not be updated.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveSkill(input: SkillInput) {
    const path = editingSkill?.id
      ? `/api/v1/skills/admin/${editingSkill.id}`
      : "/api/v1/skills/admin";
    const saved = await ownerRequest(path, {
      method: editingSkill?.id ? "PUT" : "POST",
      body: JSON.stringify(input),
    });
    if (saved) {
      const wasEditing = Boolean(editingSkill);
      setEditorOpen(false);
      setEditingSkill(null);
      setFeedback(wasEditing ? "Skill updated." : "Skill added.");
    }
  }

  async function uploadSkillLogo(file: File): Promise<SkillUpload> {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(
      `${portfolioApiUrl}/api/v1/skills/admin/images`,
      {
        method: "POST",
        credentials: "include",
        headers: await csrfHeaders(),
        body,
      },
    );
    if (!response.ok) {
      const details = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(details?.message ?? "The logo could not be uploaded.");
    }
    return (await response.json()) as SkillUpload;
  }

  async function moveSkill(index: number, offset: -1 | 1) {
    const reordered = [...skillItems];
    [reordered[index], reordered[index + offset]] = [
      reordered[index + offset],
      reordered[index],
    ];
    const ids = reordered.map((skill) => skill.id).filter(Boolean);
    if (ids.length !== reordered.length) return;
    await ownerRequest("/api/v1/skills/admin/reorder", {
      method: "PATCH",
      body: JSON.stringify({ skillIds: ids }),
    });
  }

  return (
    <section
      id="skills"
      className="skills-section anchor-section"
      aria-labelledby="skills-title"
    >
      <header className="skills-heading">
        <p className="eyebrow">Tech Stack</p>
        <LusterTitle id="skills-title">My Skills</LusterTitle>
        <p>
          Technologies and tools I use to turn ideas into reliable digital
          products.
        </p>
      </header>

      {session.admin ? (
        <div className="skills-owner-bar">
          <span>
            <Settings2 aria-hidden="true" /> Owner skill manager
          </span>
          <button
            type="button"
            onClick={() => {
              setEditingSkill(null);
              setEditorOpen(true);
            }}
          >
            <Plus aria-hidden="true" /> Add skill
          </button>
        </div>
      ) : null}

      {feedback ? (
        <p className="skills-owner-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      {session.admin && editorOpen ? (
        <SkillOwnerEditor
          key={editingSkill?.id ?? "new"}
          skill={editingSkill}
          busy={busy}
          onCancel={() => {
            setEditorOpen(false);
            setEditingSkill(null);
          }}
          onSave={(input) => void saveSkill(input)}
          onUpload={uploadSkillLogo}
        />
      ) : null}

      {session.admin ? (
        <SkillOwnerList
          skills={skillItems}
          busy={busy}
          onEdit={(skill) => {
            setEditingSkill(skill);
            setEditorOpen(true);
          }}
          onMove={(index, offset) => void moveSkill(index, offset)}
          onPublication={(skill) =>
            void ownerRequest(
              `/api/v1/skills/admin/${skill.id}/publication?published=${skill.published === false}`,
              { method: "PATCH" },
            )
          }
          onDelete={(skill) =>
            void ownerRequest(`/api/v1/skills/admin/${skill.id}`, {
              method: "DELETE",
            })
          }
        />
      ) : null}

      <SkillSphere skills={skillItems} />
    </section>
  );
}
