"use client";

import { LoaderCircle, Plus, Save, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import type { Project } from "./projectsData";

export type ProjectInput = {
  title: string;
  titleLineOne: string;
  titleLineTwo: string;
  category: string;
  description: string;
  imagePath: string;
  imagePublicId?: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition: string;
  liveUrl?: string;
  repositoryUrl?: string;
  tone: "LIME" | "CREAM";
  technologies: string[];
  caseStudyProblem: string;
  caseStudySolution: string;
  caseStudyResult: string;
  customerName: string;
  customerPhoto: string;
  customerPhotoAlt: string;
  customerRating: number;
  customerReview: string;
  published: boolean;
};

type Props = {
  project: Project | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (input: ProjectInput) => void;
  onUpload: (file: File) => Promise<ProjectImageAsset>;
};

export type ProjectImageAsset = {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
};

export function ProjectOwnerEditor({
  project,
  busy,
  onCancel,
  onSave,
  onUpload,
}: Props) {
  const [asset, setAsset] = useState({
    secureUrl: project?.image ?? "",
    publicId: project?.imagePublicId ?? "",
    width: project?.imageWidth ?? 1200,
    height: project?.imageHeight ?? 800,
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
        reason instanceof Error ? reason.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      title: String(data.get("title")),
      titleLineOne: String(data.get("titleLineOne")),
      titleLineTwo: String(data.get("titleLineTwo")),
      category: String(data.get("category")),
      description: String(data.get("description")),
      imagePath: String(data.get("imagePath")),
      imagePublicId: String(data.get("imagePublicId")) || undefined,
      imageAlt: String(data.get("imageAlt")),
      imageWidth: Number(data.get("imageWidth")),
      imageHeight: Number(data.get("imageHeight")),
      imagePosition: String(data.get("imagePosition")),
      liveUrl: String(data.get("liveUrl")) || undefined,
      repositoryUrl: String(data.get("repositoryUrl")) || undefined,
      tone: String(data.get("tone")) as "LIME" | "CREAM",
      technologies: String(data.get("technologies"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      caseStudyProblem: String(data.get("caseStudyProblem")),
      caseStudySolution: String(data.get("caseStudySolution")),
      caseStudyResult: String(data.get("caseStudyResult")),
      customerName: String(data.get("customerName")),
      customerPhoto: String(data.get("customerPhoto")),
      customerPhotoAlt: String(data.get("customerPhotoAlt")),
      customerRating: Number(data.get("customerRating")),
      customerReview: String(data.get("customerReview")),
      published: data.get("published") === "on",
    });
  }

  const field = (name: keyof ProjectInput, fallback = "") => {
    if (!project) return fallback;
    if (name === "titleLineOne") return project.titleLines[0];
    if (name === "titleLineTwo") return project.titleLines[1];
    if (name === "imagePath") return project.image;
    if (name === "caseStudyProblem") return project.caseStudy.problem;
    if (name === "caseStudySolution") return project.caseStudy.solution;
    if (name === "caseStudyResult") return project.caseStudy.result;
    return String(project[name as keyof Project] ?? fallback);
  };

  return (
    <form className="project-owner-editor" onSubmit={submit}>
      <header>
        <div>
          <p className="eyebrow">Owner editor</p>
          <h3>{project ? `Edit ${project.title}` : "Add a project"}</h3>
        </div>
        <button
          type="button"
          aria-label="Close project editor"
          onClick={onCancel}
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="project-owner-form-grid">
        <label>
          Project title
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={field("title")}
          />
        </label>
        <label>
          Category
          <input
            name="category"
            required
            maxLength={80}
            defaultValue={field("category")}
          />
        </label>
        <label>
          Title line one
          <input
            name="titleLineOne"
            required
            maxLength={80}
            defaultValue={field("titleLineOne")}
          />
        </label>
        <label>
          Title line two
          <input
            name="titleLineTwo"
            required
            maxLength={80}
            defaultValue={field("titleLineTwo")}
          />
        </label>
        <label className="is-wide">
          Description
          <textarea
            name="description"
            required
            maxLength={600}
            defaultValue={field("description")}
          />
        </label>
        <label className="is-wide project-owner-upload">
          Project image
          <input
            name="imageFile"
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
          ) : asset.publicId ? (
            <span>Cloudinary asset ready</span>
          ) : null}
          {uploadError ? (
            <span className="is-error" role="alert">
              {uploadError}
            </span>
          ) : null}
        </label>
        <label className="is-wide">
          Stored image URL
          <input name="imagePath" required readOnly value={asset.secureUrl} />
        </label>
        <input name="imagePublicId" type="hidden" value={asset.publicId} />
        <label>
          Image alt text
          <input
            name="imageAlt"
            required
            maxLength={240}
            defaultValue={field("imageAlt")}
          />
        </label>
        <label>
          Image width
          <input
            name="imageWidth"
            type="number"
            min="1"
            required
            readOnly
            value={asset.width}
          />
        </label>
        <label>
          Image height
          <input
            name="imageHeight"
            type="number"
            min="1"
            required
            readOnly
            value={asset.height}
          />
        </label>
        <label>
          Image position
          <input
            name="imagePosition"
            required
            defaultValue={field("imagePosition", "center top")}
          />
        </label>
        <label>
          Card tone
          <select
            name="tone"
            defaultValue={project?.tone === "cream" ? "CREAM" : "LIME"}
          >
            <option value="LIME">Warm lime</option>
            <option value="CREAM">Cream</option>
          </select>
        </label>
        <label>
          Live URL
          <input name="liveUrl" type="url" defaultValue={field("liveUrl")} />
        </label>
        <label>
          Repository URL
          <input
            name="repositoryUrl"
            type="url"
            defaultValue={field("repositoryUrl")}
          />
        </label>
        <label className="is-wide">
          Technologies, separated by commas
          <input
            name="technologies"
            required
            defaultValue={
              project?.technologies.join(", ") ??
              "Next.js, TypeScript, Tailwind CSS"
            }
          />
        </label>
        <fieldset className="project-owner-fieldset">
          <legend>Case study page</legend>
          <label>
            Problem
            <textarea
              name="caseStudyProblem"
              required
              maxLength={1400}
              defaultValue={field("caseStudyProblem")}
            />
          </label>
          <label>
            Solution
            <textarea
              name="caseStudySolution"
              required
              maxLength={1400}
              defaultValue={field("caseStudySolution")}
            />
          </label>
          <label>
            Result
            <textarea
              name="caseStudyResult"
              required
              maxLength={1400}
              defaultValue={field("caseStudyResult")}
            />
          </label>
        </fieldset>
        <label>
          Customer name
          <input
            name="customerName"
            required
            defaultValue={project?.customerReview.customerName}
          />
        </label>
        <label>
          Customer rating
          <input
            name="customerRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            required
            defaultValue={project?.customerReview.rating ?? 5}
          />
        </label>
        <label>
          Customer photo path
          <input
            name="customerPhoto"
            required
            defaultValue={project?.customerReview.customerPhoto ?? "/projects/"}
          />
        </label>
        <label>
          Customer photo alt
          <input
            name="customerPhotoAlt"
            required
            defaultValue={project?.customerReview.customerPhotoAlt}
          />
        </label>
        <label className="is-wide">
          Customer review
          <textarea
            name="customerReview"
            required
            maxLength={1000}
            defaultValue={project?.customerReview.review}
          />
        </label>
        <label className="project-owner-checkbox">
          <input
            name="published"
            type="checkbox"
            defaultChecked={project?.published ?? false}
          />{" "}
          Publish this project
        </label>
      </div>
      <footer>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy || uploading || !asset.secureUrl}>
          {busy ? (
            <LoaderCircle className="is-spinning" aria-hidden="true" />
          ) : project ? (
            <Save aria-hidden="true" />
          ) : (
            <Plus aria-hidden="true" />
          )}
          {busy ? "Saving…" : project ? "Save changes" : "Add project"}
        </button>
      </footer>
    </form>
  );
}
