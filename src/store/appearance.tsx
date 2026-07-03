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
import { useInsider } from "./insider";

// Appearance (light / dark). Dark mode is an Insider perk: the preference is
// stored for everyone, but only takes effect while the user is an Insider.
// Persisted in AsyncStorage (device-level, survives restarts).

type Theme = "light" | "dark";
const KEY = "verso.theme";

interface AppearanceContextValue {
  /** The user's chosen preference (persists even without Insider). */
  pref: Theme;
  /** The EFFECTIVE theme (dark only when Insider + pref dark). */
  isDark: boolean;
  /** Whether the user may switch to dark (Insider). */
  canDark: boolean;
  setPref: (theme: Theme) => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { isInsider } = useInsider();
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
      isDark: isInsider && pref === "dark",
      canDark: isInsider,
      setPref,
    }),
    [pref, isInsider, setPref],
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
