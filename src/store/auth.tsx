import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { hasSupabase, supabase } from "../lib/supabase";
import { identify } from "../lib/analytics";

// Ensure the auth browser session closes cleanly when it redirects back.
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "apple";

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
  /** Sign in via an OAuth provider (Google/Apple) through the system browser. */
  signInWithProvider: (provider: OAuthProvider) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Send a password-reset email. */
  resetPassword: (email: string) => Promise<AuthResult>;
  /** Change the signed-in user's password. */
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  /** Permanently delete the signed-in user's account (+ their data). */
  deleteAccount: () => Promise<AuthResult>;
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
      identify(s?.user?.id ?? null); // attach analytics to the opaque uid
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
      signInWithProvider: async (provider) => {
        if (!hasSupabase) return { error: "Auth not configured" };
        try {
          // Deep link the provider redirects back to (must be allow-listed in
          // Supabase -> Authentication -> URL Configuration).
          const redirectTo = Linking.createURL("auth-callback");
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo, skipBrowserRedirect: true },
          });
          if (error) return { error: error.message };
          if (!data?.url) return { error: "No auth URL returned" };
          // Open the provider's login in the system browser and wait for the
          // redirect back to our app.
          const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (res.type !== "success" || !res.url) return { error: null }; // cancelled
          // PKCE: pull the ?code=… out of the redirect and exchange it.
          const code = /[?&]code=([^&]+)/.exec(res.url)?.[1];
          if (!code) return { error: null };
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(
            decodeURIComponent(code),
          );
          return { error: exErr?.message ?? null };
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Sign-in failed" };
        }
      },
      signOut: async () => {
        if (!hasSupabase) return;
        await supabase.auth.signOut();
      },
      resetPassword: async (email) => {
        if (!hasSupabase) return { error: "Auth not configured" };
        const redirectTo = Linking.createURL("auth-callback");
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo },
        );
        return { error: error?.message ?? null };
      },
      updatePassword: async (newPassword) => {
        if (!hasSupabase) return { error: "Auth not configured" };
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        return { error: error?.message ?? null };
      },
      deleteAccount: async () => {
        if (!hasSupabase) return { error: null };
        try {
          const { error } = await supabase.rpc("delete_user");
          if (error) return { error: error.message };
          await supabase.auth.signOut();
          return { error: null };
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Delete failed" };
        }
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
