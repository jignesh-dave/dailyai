import { useState, useEffect, useCallback } from "react";
import type { AuthStatus } from "../types";

const SESSION_KEY = "dailyai_session";

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthStatus>({
    authenticated: false,
    user_email: null,
  });
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/auth/status?session=${encodeURIComponent(sid)}`);
      const data: AuthStatus = await res.json();
      if (!data.authenticated) {
        localStorage.removeItem(SESSION_KEY);
      }
      setAuth(data);
    } catch {
      setAuth({ authenticated: false, user_email: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // After OAuth callback, URL has ?session=<id>. Persist it.
    const params = new URLSearchParams(window.location.search);
    const sessionFromUrl = params.get("session");

    if (sessionFromUrl) {
      localStorage.setItem(SESSION_KEY, sessionFromUrl);
      window.history.replaceState({}, "", "/");
      checkStatus(sessionFromUrl);
    } else {
      const existing = getSessionId();
      if (existing) {
        checkStatus(existing);
      } else {
        setLoading(false);
      }
    }
  }, [checkStatus]);

  const login = useCallback(async () => {
    const res = await fetch("/api/auth/login");
    const data = await res.json();
    window.location.href = data.auth_url;
  }, []);

  const logout = useCallback(async () => {
    const sid = getSessionId();
    if (sid) {
      await fetch(`/api/auth/logout?session=${encodeURIComponent(sid)}`, {
        method: "POST",
      });
    }
    localStorage.removeItem(SESSION_KEY);
    setAuth({ authenticated: false, user_email: null });
  }, []);

  return { auth, loading, login, logout };
}
