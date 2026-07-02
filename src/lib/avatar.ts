import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { hasSupabase, supabase } from "./supabase";

// Avatar picking + upload to Supabase Storage.
// Path convention: <userId>/avatar.jpg in the public "avatars" bucket. Returns
// a cache-busted public URL (so the new image shows immediately), or null on
// cancel/error. Without Supabase, returns the local URI as a preview.

const BUCKET = "avatars";

export async function pickAndUploadAvatar(
  userId: string,
): Promise<string | null> {
  try {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    const asset = result.canceled ? null : result.assets?.[0];
    if (!asset) return null;
    if (!hasSupabase) return asset.uri; // no backend -> local preview only
    if (!asset.base64) return null;

    const path = `${userId}/avatar.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, decode(asset.base64), {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (error) return null;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;
  } catch {
    return null;
  }
}
