import { defineConfig } from "vitest/config";

// Testet NUR die reine Logik (RN-frei): src/lib/** und src/data/**.
// Komponenten/Screens (React Native) sind hier bewusst ausgeschlossen.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
