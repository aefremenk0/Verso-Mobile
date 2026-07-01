import "react-native-url-polyfill/auto";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

// Supabase client. URL + publishable key come from app.config.js `extra`
// (the publishable key is public by design — it ships in the app; write access
// is guarded by Row Level Security in the database, not by hiding the key).
//
// supabase-js is pure JS -> works in Expo Go too (no dev build needed for data
// reads/auth). Auth session persistence (AsyncStorage) comes with the auth step.

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
    persistSession: false, // switched to AsyncStorage in the auth step
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
