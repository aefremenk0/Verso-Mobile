import { hasSupabase, supabase } from "./supabase";

// Submit a place suggestion to the `spot_suggestions` table for editorial review.
// Fail-soft: without Supabase (or on error) it still resolves so the UI can show
// the thank-you state (the MVP shouldn't block on the backend).

export interface SpotSuggestion {
  name: string;
  category: string | null;
  area: string;
  note: string;
  city: string;
}

export async function submitSpotSuggestion(s: SpotSuggestion): Promise<void> {
  if (!hasSupabase) return;
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("spot_suggestions").insert({
      user_id: data.user?.id ?? null,
      name: s.name.trim(),
      category: s.category,
      area: s.area.trim() || null,
      note: s.note.trim() || null,
      city: s.city,
    });
  } catch {
    // ignore — the UI still confirms; nothing is lost for the user
  }
}
