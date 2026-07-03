import type { Lang } from "./lang";

// Turn raw Supabase / fetch error strings into calm, bilingual, human messages.
// RN-free so it stays unit-testable. Screens should pass the CURRENT language.

/** Does this look like a connectivity problem rather than a real auth error? */
export function isNetworkError(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const m = raw.toLowerCase();
  return (
    m.includes("network request failed") ||
    m.includes("failed to fetch") ||
    m.includes("fetch failed") ||
    m.includes("networkerror") ||
    m.includes("timeout") ||
    m.includes("timed out") ||
    m.includes("unable to resolve host") ||
    m.includes("could not connect") ||
    m.includes("connection")
  );
}

/**
 * Map a raw auth/DB error to a friendly bilingual message. Network problems get
 * a dedicated "no connection" line (with a retry hint); a few well-known auth
 * cases get precise wording; everything else falls back to a calm generic line.
 */
export function friendlyAuthError(raw: string | null | undefined, lang: Lang): string {
  const de = lang === "de";
  if (!raw) return de ? "Etwas ist schiefgelaufen." : "Something went wrong.";

  if (isNetworkError(raw)) {
    return de
      ? "Keine Verbindung. Prüf dein Internet und versuch es nochmal."
      : "No connection. Check your internet and try again.";
  }

  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return de
      ? "E-Mail oder Passwort stimmt nicht."
      : "That email or password isn't right.";
  }
  if (m.includes("email not confirmed")) {
    return de
      ? "Bitte bestätige zuerst deine E-Mail (Link im Postfach)."
      : "Please confirm your email first (check your inbox).";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return de
      ? "Für diese E-Mail gibt es schon ein Konto. Melde dich an."
      : "There's already an account for this email. Try signing in.";
  }
  if (m.includes("password") && (m.includes("at least") || m.includes("weak") || m.includes("6 char"))) {
    return de
      ? "Das Passwort ist zu kurz (mind. 6 Zeichen)."
      : "That password is too short (min. 6 characters).";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return de
      ? "Zu viele Versuche. Warte kurz und versuch es erneut."
      : "Too many attempts. Wait a moment and try again.";
  }
  if (m.includes("user not found")) {
    return de
      ? "Zu dieser E-Mail gibt es kein Konto."
      : "No account for this email.";
  }

  // Unknown -> keep it calm, don't leak the raw technical string.
  return de ? "Etwas ist schiefgelaufen. Versuch es nochmal." : "Something went wrong. Please try again.";
}
