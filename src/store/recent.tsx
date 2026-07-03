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

// "Recently viewed" spots. Device-level (works for guests too — it's a browsing
// convenience, not account data), persisted in AsyncStorage. Most-recent first,
// capped so it stays a short rail.

const KEY = "verso.recent";
const CAP = 12;

interface RecentContextValue {
  recentIds: string[];
  pushRecent: (id: string) => void;
  clearRecent: () => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);

export function RecentProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Hydrate once from disk.
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setRecentIds(arr.filter((x) => typeof x === "string"));
        } catch {
          /* ignore corrupt cache */
        }
      })
      .catch(() => {});
  }, []);

  const pushRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      // Move to front, dedupe, cap.
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, CAP);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const value = useMemo<RecentContextValue>(
    () => ({ recentIds, pushRecent, clearRecent }),
    [recentIds, pushRecent, clearRecent],
  );

  return <RecentContext.Provider value={value}>{children}</RecentContext.Provider>;
}

export function useRecent(): RecentContextValue {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error("useRecent must be used within <RecentProvider>.");
  return ctx;
}
