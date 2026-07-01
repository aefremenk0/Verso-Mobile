import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

// Supabase client. URL + publishable key come from app.config.js `extra`
// (the publishable key is public by design — it ships in the app; write access
// is guarded by Row Level Security in the database, not by hiding the key).
//
// supabase-js is pure JS -> works in Expo Go too (no dev build needed for data
// reads/auth). The auth session is persisted in AsyncStorage (a pure-JS wrapper
// that is bundled with Expo Go), so a logged-in user stays logged in across
// app restarts. `detectSessionInUrl` is off (no browser URL on native).

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseKey?: string;
};

const url = extra.supabaseUrl ?? "";
const key = extra.supabaseKey ?? "";

/** True when Supabase is configured — screens fall back to mock data if not. */
export const hasSupabase = Boolean(url && key);

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
