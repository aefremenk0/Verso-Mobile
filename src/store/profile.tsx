import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchProfileRow, patchProfile } from "../lib/profile";
import { supabase, hasSupabase } from "../lib/supabase";
import { MOCK_USER } from "../data/user";
import { useAuth } from "./auth";

// User profile (name / username / bio). Backed by the Supabase `profiles` row of
// the signed-in user. Guest = the mock profile, so the UI always has something
// to show. Chosen at registration and editable later.

interface ProfileFields {
  name: string;
  username: string;
  bio: string;
}

interface ProfileContextValue extends ProfileFields {
  /** Save (upsert) profile fields for the current user. */
  save: (fields: Partial<ProfileFields>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Load the profile row whenever the signed-in user changes.
  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid) {
      // Guest: fall back to the mock so the profile screen isn't empty.
      setName(MOCK_USER.name);
      setUsername(MOCK_USER.username);
      setBio(MOCK_USER.bio);
      return;
    }
    let cancelled = false;
    (async () => {
      const row = await fetchProfileRow(uid, ["name", "username", "bio"]);
      if (cancelled) return;
      setName((row?.name as string) ?? "");
      setUsername((row?.username as string) ?? "");
      setBio((row?.bio as string) ?? "");
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const save = useCallback(async (fields: Partial<ProfileFields>) => {
    // Optimistic local update.
    if (fields.name !== undefined) setName(fields.name);
    if (fields.username !== undefined) setUsername(fields.username);
    if (fields.bio !== undefined) setBio(fields.bio);
    if (!hasSupabase) return;
    // Resolve the uid live (avoids a race with the auth state update).
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    await patchProfile(uid, fields);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ name, username, bio, save }),
    [name, username, bio, save],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within <ProfileProvider>.");
  return ctx;
}
