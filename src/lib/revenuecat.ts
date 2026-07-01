import Constants from "expo-constants";

// RevenueCat access. The public SDK key comes from app.config.js `extra`
// (safe to ship — it can only read offerings / purchase as the user, never
// manage the account). Unlocking Insider is tied to the "insider" entitlement.
//
// react-native-purchases is a NATIVE module -> it does NOT exist in Expo Go.
// We therefore require() it lazily and only outside Expo Go, so importing this
// file never crashes the Expo Go client (there the app stays on the mock
// preview, exactly like the map falls back to the stylized version).

const extra = (Constants.expoConfig?.extra ?? {}) as {
  revenueCatIosKey?: string;
  revenueCatEntitlement?: string;
};

export const REVENUECAT_IOS_KEY = extra.revenueCatIosKey ?? "";
export const ENTITLEMENT_ID = extra.revenueCatEntitlement ?? "insider";

// Expo Go reports "storeClient"; a dev/standalone build reports "standalone".
const isExpoGo = Constants.executionEnvironment === "storeClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Purchases: any = null;
if (!isExpoGo && REVENUECAT_IOS_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Purchases = require("react-native-purchases").default;
  } catch {
    Purchases = null;
  }
}

/** True only in a dev/standalone build with the SDK key set. */
export const hasRevenueCat = Boolean(Purchases && REVENUECAT_IOS_KEY);

export { Purchases };
