"use client";

import { LoaderCircle, Plus, Save, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import type { Skill } from "./skillsData";

export type SkillInput = {
  name: string;
  category: string;
  logoUrl: string;
  logoPublicId?: string;
  published: boolean;
};

type SkillUpload = { secureUrl: string; publicId: string };

type Props = {
  skill: Skill | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (input: SkillInput) => void;
  onUpload: (file: File) => Promise<SkillUpload>;
};

export function SkillOwnerEditor({
  skill,
  busy,
  onCancel,
  onSave,
  onUpload,
}: Props) {
  const [asset, setAsset] = useState({
    secureUrl: skill?.logo ?? "",
    publicId: skill?.logoPublicId ?? "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      setAsset(await onUpload(file));
    } catch (reason) {
      setUploadError(
        reason instanceof Error ? reason.message : "Logo upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")).trim(),
      category: String(data.get("category")).trim(),
      logoUrl: asset.secureUrl,
      logoPublicId: asset.publicId || undefined,
      published: data.get("published") === "on",
    });
  }

  return (
    <form className="skill-owner-editor" onSubmit={submit}>
      <header>
        <div>
          <p className="eyebrow">Owner editor</p>
          <h3>{skill ? `Edit ${skill.name}` : "Add a skill"}</h3>
        </div>
        <button
          type="button"
          aria-label="Close skill editor"
          onClick={onCancel}
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="skill-owner-form-grid">
        <label>
          Skill name
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={skill?.name}
          />
        </label>
        <label>
          Category
          <input
            name="category"
            maxLength={80}
            placeholder="Frontend, backend, tooling…"
            defaultValue={skill?.category}
          />
        </label>
        <label className="is-wide skill-owner-upload">
          Skill logo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <small>JPEG, PNG, WebP or AVIF · maximum 10 MB</small>
          {uploading ? (
            <span>
              <LoaderCircle className="is-spinning" aria-hidden="true" />
              Uploading to Cloudinary…
            </span>
          ) : asset.secureUrl ? (
            <span>Logo ready</span>
          ) : null}
          {uploadError ? (
            <span className="is-error" role="alert">
              {uploadError}
            </span>
          ) : null}
        </label>
        <label className="skill-owner-checkbox">
          <input
            name="published"
            type="checkbox"
            defaultChecked={skill?.published ?? false}
          />
          Publish this skill
        </label>
      </div>
      <footer>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy || uploading || !asset.secureUrl}>
          {busy ? (
            <LoaderCircle className="is-spinning" aria-hidden="true" />
          ) : skill ? (
            <Save aria-hidden="true" />
          ) : (
            <Plus aria-hidden="true" />
          )}
          {busy ? "Saving…" : skill ? "Save changes" : "Add skill"}
        </button>
      </footer>
    </form>
  );
}
