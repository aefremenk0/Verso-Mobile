import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

// Alternate app icons (iOS). The default icon (white "v." on dark) ships for
// everyone; the two color variants are an Insider perk. Native module -> only
// available in a dev/standalone build on iOS (guarded so Expo Go doesn't crash).

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mod: any = null;
if (!isExpoGo && Platform.OS === "ios") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("expo-alternate-app-icons");
  } catch {
    mod = null;
  }
}

/** True when alternate icons can actually be switched (iOS dev build + device
 * support). `supportsAlternateIcons` is false in Expo Go and on the (few)
 * devices without the capability, so this is the real gate the UI checks. */
export const hasAltIcons = Boolean(mod) && mod.supportsAlternateIcons === true;

// Names must match app.config.js. "Default" = the main icon (null).
export type IconKey = "Default" | "Gold" | "Inverse";

export function currentIcon(): IconKey {
  if (!mod) return "Default";
  try {
    const name = mod.getAppIconName?.();
    return name === "Gold" || name === "Inverse" ? name : "Default";
  } catch {
    return "Default";
  }
}

export async function setIcon(key: IconKey): Promise<boolean> {
  if (!mod) return false;
  try {
    await mod.setAlternateAppIcon(key === "Default" ? null : key);
    return true;
  } catch {
    return false;
  }
}
