import { useLanguage } from "../store/language";
import type { Lang } from "./lang";

// Lightweight i18n: instead of a central key dictionary, every call site carries
// both languages inline — t("Saved", "Gespeichert"). Easy to read in context and
// to apply per file. For data content (spots/neighborhoods) see `localized.ts`.

/** Hook returning a picker bound to the active language. */
export function useT() {
  const { lang } = useLanguage();
  return (en: string, de: string) => (lang === "de" ? de : en);
}

/** Convenience: the active language. */
export function useLang(): Lang {
  return useLanguage().lang;
}
