import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Scene } from "../lib/scene";

// Currently selected "scene" (going out vs. dining). Set by the scene toggle in
// the top right and read by Feed, Map and Neighborhood — one source for all.

interface SceneContextValue {
  scene: Scene;
  setScene: (s: Scene) => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState<Scene>("essen");

  const value = useMemo<SceneContextValue>(() => ({ scene, setScene }), [scene]);

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error("useScene must be used within <SceneProvider>.");
  }
  return ctx;
}
