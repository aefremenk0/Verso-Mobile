import { getLocales } from "expo-localization";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Lang } from "../lib/lang";

// App language store. Defaults to the device language (German devices -> "de",
// otherwise English), then the Settings toggle flips it at runtime. In-memory
// only, like the other stores.

function deviceLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase();
    return code === "de" ? "de" : "en";
  } catch {
    return "en";
  }
}

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(deviceLang);
  const toggle = () => setLang((l) => (l === "de" ? "en" : "de"));
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage must be used within <LanguageProvider>.");
  return ctx;
}
