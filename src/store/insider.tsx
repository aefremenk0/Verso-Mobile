import { createContext, useContext, useState, type ReactNode } from "react";

// Verso Insider membership (premium). In-memory only, no backend in the MVP —
// default false. The Insider screen offers a mock "preview" unlock so the
// Insider-only scenes (Sport, Live Events) can actually be tried out. Reset on
// logout.

interface InsiderContextValue {
  isInsider: boolean;
  setInsider: (v: boolean) => void;
  reset: () => void;
}

const InsiderContext = createContext<InsiderContextValue | null>(null);

export function InsiderProvider({ children }: { children: ReactNode }) {
  const [isInsider, setInsider] = useState(false);
  return (
    <InsiderContext.Provider
      value={{ isInsider, setInsider, reset: () => setInsider(false) }}
    >
      {children}
    </InsiderContext.Provider>
  );
}

export function useInsider(): InsiderContextValue {
  const ctx = useContext(InsiderContext);
  if (!ctx)
    throw new Error("useInsider must be used within <InsiderProvider>.");
  return ctx;
}
