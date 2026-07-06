import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
// Appearance (light / dark). Dark mode is available to EVERYONE (not gated on
// Insider). The preference is persisted in AsyncStorage (device-level, survives
// restarts).

type Theme = "light" | "dark";
const KEY = "verso.theme";

interface AppearanceContextValue {
  /** The user's chosen preference. */
  pref: Theme;
  /** The EFFECTIVE theme (dark when pref is dark). */
  isDark: boolean;
  /** Kept for API compatibility — dark mode is always available now. */
  canDark: boolean;
  setPref: (theme: Theme) => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<Theme>("light");

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === "dark" || v === "light") setPrefState(v);
      })
      .catch(() => {});
  }, []);

  const setPref = useCallback((theme: Theme) => {
    setPrefState(theme);
    AsyncStorage.setItem(KEY, theme).catch(() => {});
  }, []);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      pref,
      isDark: pref === "dark",
      canDark: true,
      setPref,
    }),
    [pref, setPref],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx)
    throw new Error("useAppearance must be used within <AppearanceProvider>.");
  return ctx;
}

// Dark theme values (space-separated RGB channels to match global.css).
export const DARK_VARS = {
  "--c-screen": "22 19 16", // #161310 warm near-black
  "--c-surface": "33 29 24", // #211D18 dark card
  "--c-chip": "42 38 33", // #2A2621
  "--c-ink": "245 241 234", // #F5F1EA near-white
  "--c-ink-2": "184 178 168", // #B8B2A8
  "--c-ink-3": "143 136 126", // #8F887E
  "--c-line": "245 241 234", // light hairlines on dark surfaces
};

// Light theme values (mirror global.css :root). We apply these explicitly in
// light mode so ThemedApp's `style` is ALWAYS a vars() object — never toggling
// between `undefined` and an object. That prevents NativeWind from restructuring
// the View that wraps the navigator on a theme switch (which briefly tore down
// the navigator -> "Couldn't find a navigation context" crash).
export const LIGHT_VARS = {
  "--c-screen": "247 244 239",
  "--c-surface": "255 255 255",
  "--c-chip": "237 233 225",
  "--c-ink": "26 26 26",
  "--c-ink-2": "110 106 99",
  "--c-ink-3": "138 133 124",
  "--c-line": "26 26 26",
};
