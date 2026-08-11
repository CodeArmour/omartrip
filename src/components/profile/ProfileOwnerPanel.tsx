"use client";

import Image from "next/image";
import { Pencil, Save, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { usePortfolioAuth } from "@/components/auth/PortfolioAuthProvider";
import { usePortfolioProfile } from "./PortfolioProfileProvider";
import type { PortfolioProfile } from "@/config/profile";

function externalUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ProfileOwnerPanel({
  linksOnly = false,
  showSavedLinks = false,
}: {
  linksOnly?: boolean;
  showSavedLinks?: boolean;
}) {
  const { session } = usePortfolioAuth();
  const { profile, update, uploadPortrait, saving, feedback } =
    usePortfolioProfile();
  const [open, setOpen] = useState(false);
  const [portrait, setPortrait] = useState({
    url: profile.portraitUrl,
    publicId: profile.portraitPublicId ?? "",
  });
  const [uploading, setUploading] = useState(false);
  if (!session.admin) return null;

  async function upload(file: File) {
    setUploading(true);
    try {
      const asset = await uploadPortrait(file);
      setPortrait({ url: asset.secureUrl, publicId: asset.publicId });
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: PortfolioProfile = {
      fullName: linksOnly
        ? profile.fullName
        : String(data.get("fullName")).trim(),
      role: linksOnly ? profile.role : String(data.get("role")).trim(),
      location: linksOnly
        ? profile.location
        : String(data.get("location")).trim(),
      heroEyebrow: linksOnly
        ? profile.heroEyebrow
        : String(data.get("heroEyebrow")).trim(),
      heroSupporting: linksOnly
        ? profile.heroSupporting
        : String(data.get("heroSupporting")).trim(),
      aboutBio: linksOnly
        ? profile.aboutBio
        : String(data.get("aboutBio")).trim(),
      services: linksOnly
        ? profile.services
        : String(data.get("services")).trim(),
      portraitUrl: linksOnly ? profile.portraitUrl : portrait.url,
      portraitPublicId: linksOnly
        ? profile.portraitPublicId
        : portrait.publicId || undefined,
      openToCollaboration: linksOnly
        ? profile.openToCollaboration
        : data.get("openToCollaboration") === "on",
      email: String(data.get("email")).trim(),
      githubUrl: String(data.get("githubUrl")).trim(),
      linkedinUrl: String(data.get("linkedinUrl")).trim(),
    };
    await update(next);
    setOpen(false);
  }

  return (
    <div className="profile-owner-panel">
      <div className="profile-owner-bar">
        <span>
          <Pencil aria-hidden="true" />{" "}
          {linksOnly ? "Owner links" : "Owner personal details"}
        </span>
        <button
          type="button"
          onClick={() => {
            setPortrait({
              url: profile.portraitUrl,
              publicId: profile.portraitPublicId ?? "",
            });
            setOpen((value) => !value);
          }}
        >
          {open ? <X aria-hidden="true" /> : <Pencil aria-hidden="true" />}{" "}
          {open ? "Close" : linksOnly ? "Edit links" : "Edit profile"}
        </button>
      </div>
      {feedback ? (
        <p className="profile-owner-feedback" role="status">
          {feedback}
        </p>
      ) : null}
      {linksOnly || showSavedLinks ? (
        <nav
          className="profile-owner-saved-links"
          aria-label="Saved profile links"
        >
          <span>Saved links</span>
          <a
            href={externalUrl(profile.githubUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <strong aria-hidden="true">↗</strong>
          </a>
          <a
            href={externalUrl(profile.linkedinUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn <strong aria-hidden="true">↗</strong>
          </a>
          <a href={`mailto:${profile.email}`}>
            Email <strong aria-hidden="true">↗</strong>
          </a>
        </nav>
      ) : null}
      {open ? (
        <form
          className="profile-owner-editor"
          onSubmit={(event) => void submit(event)}
        >
          {!linksOnly ? (
            <div className="profile-owner-preview">
              <Image
                src={portrait.url}
                alt=""
                width={64}
                height={64}
                sizes="64px"
              />
              <span>Profile image</span>
            </div>
          ) : null}
          {!linksOnly ? (
            <label>
              Full name
              <input
                name="fullName"
                required
                maxLength={120}
                defaultValue={profile.fullName}
              />
            </label>
          ) : null}
          {!linksOnly ? (
            <label>
              Role
              <input
                name="role"
                required
                maxLength={120}
                defaultValue={profile.role}
              />
            </label>
          ) : null}
          {!linksOnly ? (
            <label>
              Location
              <input
                name="location"
                required
                maxLength={160}
                defaultValue={profile.location}
              />
            </label>
          ) : null}
          {!linksOnly ? (
            <label>
              Hero eyebrow
              <input
                name="heroEyebrow"
                required
                maxLength={160}
                defaultValue={profile.heroEyebrow}
              />
            </label>
          ) : null}
          {!linksOnly ? (
            <label className="is-wide">
              Hero supporting copy
              <textarea
                name="heroSupporting"
                required
                maxLength={500}
                defaultValue={profile.heroSupporting}
              />
            </label>
          ) : null}
          {!linksOnly ? (
            <label className="is-wide">
              About bio
              <textarea
                name="aboutBio"
                required
                maxLength={1000}
                defaultValue={profile.aboutBio}
              />
            </label>
          ) : null}
          {!linksOnly ? (
            <label className="is-wide">
              Services
              <textarea
                name="services"
                required
                maxLength={500}
                defaultValue={profile.services}
              />
            </label>
          ) : null}
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              defaultValue={profile.email}
            />
          </label>
          <label>
            GitHub URL
            <input
              name="githubUrl"
              type="url"
              required
              defaultValue={profile.githubUrl}
            />
          </label>
          <label className="is-wide">
            LinkedIn URL
            <input
              name="linkedinUrl"
              type="url"
              required
              defaultValue={profile.linkedinUrl}
            />
          </label>
          {!linksOnly ? (
            <label className="is-wide">
              Portrait
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
              <small>
                {uploading
                  ? "Uploading to Cloudinary…"
                  : "JPEG, PNG, WebP or AVIF · maximum 10 MB"}
              </small>
            </label>
          ) : null}
          {!linksOnly ? (
            <label className="profile-owner-checkbox">
              <input
                name="openToCollaboration"
                type="checkbox"
                defaultChecked={profile.openToCollaboration}
              />{" "}
              Open to collaboration and freelance
            </label>
          ) : null}
          <footer>
            <button type="submit" disabled={saving || uploading}>
              <Save aria-hidden="true" /> {saving ? "Saving…" : "Save details"}
            </button>
          </footer>
        </form>
      ) : null}
    </div>
  );
}
