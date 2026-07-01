import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabase, supabase } from "../lib/supabase";

// Auth store — wraps Supabase Auth (email + password). The session is persisted
// in AsyncStorage (see lib/supabase.ts), so a logged-in user stays logged in
// across restarts. When Supabase is NOT configured (hasSupabase === false) the
// store degrades gracefully: sign-up/sign-in just succeed locally so the app
// stays usable as a guest (matches the old mock flow).

interface AuthResult {
  /** null on success, otherwise a human-readable error message. */
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True while the persisted session is being restored on launch. */
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Only "loading" when Supabase can actually restore a session.
  const [loading, setLoading] = useState<boolean>(hasSupabase);

  useEffect(() => {
    if (!hasSupabase) return;
    let cancelled = false;
    // Restore any persisted session on launch …
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
    });
    // … and keep it in sync with sign-in / sign-out / token refresh.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp: async (email, password) => {
        if (!hasSupabase) return { error: null }; // guest mode
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        return { error: error?.message ?? null };
      },
      signIn: async (email, password) => {
        if (!hasSupabase) return { error: null }; // guest mode
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        if (!hasSupabase) return;
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}
