import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasSupabase, supabase } from "./supabase";

// Persistence helpers for the per-user stores (saved / interests / geheimtipp).
//
// Strategy: AsyncStorage is the fast local cache (instant, offline); the
// Supabase `profiles` row is the source of truth when the user is signed in.
// Every helper fails soft — on any error we simply fall back to local/mock so
// the app never breaks because the network or DB hiccuped.

/** Columns on `profiles` that the stores read/write. */
export type ProfileColumn =
  | "saved_spot_ids"
  | "interests"
  | "geheimtipp_abgeholt"
  | "notify";

export async function loadLocal(key: string): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export async function saveLocal(key: string, value: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (storage full / unavailable) — DB stays the truth
  }
}

/** Read one array column from the signed-in user's profile row (null on error). */
export async function fetchProfileColumn(
  userId: string,
  column: ProfileColumn,
): Promise<string[] | null> {
  if (!hasSupabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(column)
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    const val = (data as Record<string, unknown>)[column];
    return Array.isArray(val) ? (val as string[]) : null;
  } catch {
    return null;
  }
}

/** Write one array column back to the user's profile row (upsert, fail-soft). */
export async function patchProfileColumn(
  userId: string,
  column: ProfileColumn,
  value: string[],
): Promise<void> {
  if (!hasSupabase) return;
  try {
    await supabase
      .from("profiles")
      .upsert({ id: userId, [column]: value }, { onConflict: "id" });
  } catch {
    // ignore — the local cache still holds the value
  }
}

/** Read text fields (name/username/bio) from the profile row (null on error). */
export async function fetchProfileRow(
  userId: string,
  columns: string[],
): Promise<Record<string, unknown> | null> {
  if (!hasSupabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(columns.join(","))
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Upsert arbitrary profile fields (e.g. name/username/bio), fail-soft. */
export async function patchProfile(
  userId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  if (!hasSupabase) return;
  try {
    await supabase
      .from("profiles")
      .upsert({ id: userId, ...patch }, { onConflict: "id" });
  } catch {
    // ignore
  }
}
