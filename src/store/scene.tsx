import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Scene } from "../lib/scene";

// Aktuell gewählte „Szene" (Ausgehen vs. Essen). Wird vom Szenen-Toggle oben
// rechts gesetzt und von Feed, Karte und Bezirk gelesen — eine Quelle für alle.

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
    throw new Error("useScene muss innerhalb von <SceneProvider> genutzt werden.");
  }
  return ctx;
}
