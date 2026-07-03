import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  /** Public URL of the user's avatar image ("" if none). */
  avatarUrl: string;
  /** Save (upsert) profile fields for the current user. Reports write failure. */
  save: (fields: Partial<ProfileFields>) => Promise<{ error: string | null }>;
  /** Store a freshly uploaded avatar URL on the profile. Reports write failure. */
  saveAvatar: (url: string) => Promise<{ error: string | null }>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  // Values just written via save() — used so a concurrent login-fetch that
  // reads the row *before* the write commits doesn't clobber them (registration
  // race: the effect below fires the moment the user is set, while save() is
  // still writing).
  const justSaved = useRef<{ uid: string; fields: Partial<ProfileFields> } | null>(
    null,
  );

  // Load the profile row whenever the signed-in user changes.
  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid) {
      // Guest: fall back to the mock so the profile screen isn't empty.
      justSaved.current = null;
      setName(MOCK_USER.name);
      setUsername(MOCK_USER.username);
      setBio(MOCK_USER.bio);
      setAvatarUrl("");
      return;
    }
    let cancelled = false;
    (async () => {
      const row = await fetchProfileRow(uid, [
        "name",
        "username",
        "bio",
        "avatar_url",
      ]);
      if (cancelled) return;
      // Prefer a non-empty DB value; otherwise a value we just saved for this
      // user (write may not have committed yet); otherwise empty.
      const saved =
        justSaved.current?.uid === uid ? justSaved.current.fields : undefined;
      const pick = (col: keyof ProfileFields) =>
        ((row?.[col] as string) || "") || (saved?.[col] ?? "") || "";
      setName(pick("name"));
      setUsername(pick("username"));
      setBio(pick("bio"));
      setAvatarUrl((row?.avatar_url as string) || "");
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const save = useCallback(
    async (fields: Partial<ProfileFields>) => {
      // Optimistic local update.
      if (fields.name !== undefined) setName(fields.name);
      if (fields.username !== undefined) setUsername(fields.username);
      if (fields.bio !== undefined) setBio(fields.bio);
      if (!hasSupabase) return { error: null };
      // Resolve the uid live (avoids a race with the auth state update).
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return { error: null };
      // Remember what we wrote so a concurrent login-fetch can't clobber it.
      justSaved.current = { uid, fields };
      return patchProfile(uid, fields);
    },
    [],
  );

  const saveAvatar = useCallback(async (url: string) => {
    setAvatarUrl(url);
    if (!hasSupabase) return { error: null };
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return { error: null };
    return patchProfile(uid, { avatar_url: url });
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ name, username, bio, avatarUrl, save, saveAvatar }),
    [name, username, bio, avatarUrl, save, saveAvatar],
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
