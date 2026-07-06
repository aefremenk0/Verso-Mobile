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

interface SignUpResult extends AuthResult {
  /** True when the account was created but email confirmation is required
   *  (no session yet) — the user must click the link in their inbox first. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True while the persisted session is being restored on launch. */
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    meta?: { name?: string; username?: string },
  ) => Promise<SignUpResult>;
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
  /** True when a password-reset link was opened -> show the reset screen. A
   *  watcher UNDER the navigator consumes this (we must not navigate from the
   *  provider, which renders above the navigator). */
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Only "loading" when Supabase can actually restore a session.
  const [loading, setLoading] = useState<boolean>(hasSupabase);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

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
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      identify(s?.user?.id ?? null); // attach analytics to the opaque uid
      // Landed via a password-reset email link -> flag it. We do NOT navigate
      // here: this provider renders ABOVE the navigator, so calling the router
      // now (possibly before the navigator has mounted) throws "no navigation
      // context". A watcher under the navigator performs the navigation.
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Handle auth deep links that OPEN the app (password reset / email confirmation).
  // The OAuth flow reads its redirect inline; these links instead arrive here via
  // the URL scheme, so we pull the PKCE ?code=… and exchange it for a session.
  // supabase-js then emits PASSWORD_RECOVERY / SIGNED_IN (handled above).
  useEffect(() => {
    if (!hasSupabase) return;
    const handle = async (url: string | null) => {
      if (!url || !url.includes("code=")) return;
      const code = /[?&]code=([^&]+)/.exec(url)?.[1];
      if (!code) return;
      try {
        await supabase.auth.exchangeCodeForSession(decodeURIComponent(code));
      } catch {
        /* already exchanged (e.g. by the OAuth flow) or invalid — ignore */
      }
    };
    Linking.getInitialURL().then(handle); // cold start via the link
    const sub = Linking.addEventListener("url", (e) => handle(e.url)); // warm
    return () => sub.remove();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp: async (email, password, meta) => {
        if (!hasSupabase) return { error: null }; // guest mode
        // emailRedirectTo: the confirmation link opens back into the app
        // (verso://auth-callback) so exchangeCodeForSession completes the sign-in.
        // data: name/username ride along as user metadata so the handle_new_user
        // trigger can write them into `profiles` even before the first session
        // exists (email-confirmation flow).
        const redirectTo = Linking.createURL("auth-callback");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectTo, data: meta ?? {} },
        });
        if (error) return { error: error.message };
        // No session back => "Confirm email" is ON: the user must verify first.
        return { error: null, needsConfirmation: !data.session };
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
      passwordRecovery,
      clearPasswordRecovery: () => setPasswordRecovery(false),
    }),
    [session, loading, passwordRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}
