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

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8081";

export type PortfolioAuthSession = {
  authenticated: boolean;
  admin: boolean;
  displayName?: string;
  avatarUrl?: string;
};

type AuthProviderOption = { id: string; authorizationUrl: string };
type CsrfMetadata = { token: string; headerName: string };

type PortfolioAuthContextValue = {
  session: PortfolioAuthSession;
  providers: AuthProviderOption[];
  loading: boolean;
  signIn: (provider: string) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  csrfHeaders: () => Promise<Record<string, string>>;
};

const signedOut: PortfolioAuthSession = { authenticated: false, admin: false };
const PortfolioAuthContext = createContext<PortfolioAuthContextValue | null>(
  null,
);

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error("Authentication request failed");
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export function PortfolioAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PortfolioAuthSession>(signedOut);
  const [providers, setProviders] = useState<AuthProviderOption[]>([]);
  const [csrf, setCsrf] = useState<CsrfMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [nextSession, nextProviders] = await Promise.all([
        apiFetch<PortfolioAuthSession>("/api/v1/auth/me"),
        apiFetch<AuthProviderOption[]>("/api/v1/auth/providers"),
      ]);
      setSession(nextSession);
      setProviders(nextProviders);
      if (!nextSession.authenticated) setCsrf(null);
    } catch {
      setSession(signedOut);
      setProviders([]);
      setCsrf(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const sync = () => void refresh();
    window.addEventListener("portfolio-auth-changed", sync);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("portfolio-auth-changed", sync);
    };
  }, [refresh]);

  const csrfHeaders = useCallback(async () => {
    const metadata =
      csrf ?? (await apiFetch<CsrfMetadata>("/api/v1/auth/csrf"));
    setCsrf(metadata);
    return { [metadata.headerName]: metadata.token };
  }, [csrf]);

  const signIn = useCallback(
    (provider: string) => {
      const configured = providers.find((item) => item.id === provider);
      if (!configured) return;
      const returnTo = `${window.location.pathname}${window.location.hash}`;
      // OAuth begins on the Spring backend and therefore requires a full-page navigation.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `${API_URL}${configured.authorizationUrl}?returnTo=${encodeURIComponent(returnTo)}`;
    },
    [providers],
  );

  const signOut = useCallback(async () => {
    await apiFetch<void>("/api/v1/auth/logout", {
      method: "POST",
      headers: await csrfHeaders(),
    });
    setSession(signedOut);
    setCsrf(null);
    window.dispatchEvent(new Event("portfolio-auth-changed"));
  }, [csrfHeaders]);

  const value = useMemo(
    () => ({
      session,
      providers,
      loading,
      signIn,
      signOut,
      refresh,
      csrfHeaders,
    }),
    [session, providers, loading, signIn, signOut, refresh, csrfHeaders],
  );

  return (
    <PortfolioAuthContext.Provider value={value}>
      {children}
    </PortfolioAuthContext.Provider>
  );
}

export function usePortfolioAuth() {
  const context = useContext(PortfolioAuthContext);
  if (!context)
    throw new Error(
      "usePortfolioAuth must be used inside PortfolioAuthProvider",
    );
  return context;
}

export { API_URL as portfolioApiUrl };
