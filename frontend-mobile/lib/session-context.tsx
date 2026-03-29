import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearAuthSession, getAccessToken, getRefreshToken, getStoredUser, setAuthSession, type StoredUser } from "@/lib/auth-store";
import { fetchCurrentUser, login } from "@/lib/api";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  status: SessionStatus;
  user: StoredUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<StoredUser | null>(null);

  async function refreshUser() {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    const storedUser = await getStoredUser();

    if (!accessToken || !refreshToken || !storedUser) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const response = await fetchCurrentUser();
      const nextUser = { ...storedUser, ...response.user };
      setUser(nextUser);
      await setAuthSession({
        accessToken,
        refreshToken,
        user: nextUser,
      });
      setStatus("authenticated");
    } catch {
      await clearAuthSession();
      setUser(null);
      setStatus("unauthenticated");
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const storedUser = await getStoredUser();
        setUser(storedUser);
        await refreshUser();
      } catch {
        await clearAuthSession();
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    void bootstrap();
  }, []);

  async function signIn(email: string, password: string) {
    const payload = await login(email.trim(), password);
    setUser(payload.user);
    setStatus("authenticated");
  }

  async function signOut() {
    await clearAuthSession();
    setUser(null);
    setStatus("unauthenticated");
  }

  const value = useMemo(
    () => ({ status, user, signIn, signOut, refreshUser }),
    [status, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return value;
}