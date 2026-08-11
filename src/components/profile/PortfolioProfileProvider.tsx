"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  portfolioApiUrl,
  usePortfolioAuth,
} from "@/components/auth/PortfolioAuthProvider";
import { fallbackProfile, type PortfolioProfile } from "@/config/profile";

type ProfileContextValue = {
  profile: PortfolioProfile;
  update: (profile: PortfolioProfile) => Promise<void>;
  uploadPortrait: (
    file: File,
  ) => Promise<{ secureUrl: string; publicId: string }>;
  saving: boolean;
  feedback: string;
};
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function PortfolioProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { session, csrfHeaders } = usePortfolioAuth();
  const [profile, setProfile] = useState(fallbackProfile);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const normalizeProfile = useCallback(
    (value: Partial<PortfolioProfile>) => ({
      ...fallbackProfile,
      ...value,
      email: value.email || fallbackProfile.email,
      githubUrl: value.githubUrl || fallbackProfile.githubUrl,
      linkedinUrl: value.linkedinUrl || fallbackProfile.linkedinUrl,
    }),
    [],
  );

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${portfolioApiUrl}/api/v1/profile`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      setProfile(
        normalizeProfile((await response.json()) as Partial<PortfolioProfile>),
      );
    } catch {
      setProfile(fallbackProfile);
    }
  }, [normalizeProfile]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load, session.authenticated]);

  const update = useCallback(
    async (next: PortfolioProfile) => {
      setSaving(true);
      setFeedback("");
      try {
        const response = await fetch(
          `${portfolioApiUrl}/api/v1/profile/admin`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(await csrfHeaders()),
            },
            body: JSON.stringify(next),
          },
        );
        if (!response.ok)
          throw new Error("Personal details could not be saved.");
        setProfile((await response.json()) as PortfolioProfile);
        setFeedback("Personal details saved.");
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "Personal details could not be saved.",
        );
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [csrfHeaders],
  );

  const uploadPortrait = useCallback(
    async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/profile/admin/images`,
        {
          method: "POST",
          credentials: "include",
          headers: await csrfHeaders(),
          body,
        },
      );
      if (!response.ok) throw new Error("The portrait could not be uploaded.");
      return (await response.json()) as { secureUrl: string; publicId: string };
    },
    [csrfHeaders],
  );

  const value = useMemo(
    () => ({ profile, update, uploadPortrait, saving, feedback }),
    [profile, update, uploadPortrait, saving, feedback],
  );
  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function usePortfolioProfile() {
  const context = useContext(ProfileContext);
  if (!context)
    throw new Error(
      "usePortfolioProfile must be used inside PortfolioProfileProvider",
    );
  return context;
}
