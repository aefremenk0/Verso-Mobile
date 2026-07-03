import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardDoneBar,
  KEYBOARD_DONE_ID,
} from "../src/components/KeyboardDoneBar";
import { StripeTexture } from "../src/components/StripeTexture";
import { pickAndUploadAvatar } from "../src/lib/avatar";
import { initialsFromName } from "../src/lib/initials";
import { useT } from "../src/lib/i18n";
import { supabase, hasSupabase } from "../src/lib/supabase";
import { useProfile } from "../src/store/profile";

// Screen 07c — Edit profile. Prefilled from the user's profile; Save upserts
// name/username/bio back to Supabase (via useProfile).

// Labeled input field in the Verso style.
function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View>
      <Text className="mb-1.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        inputAccessoryViewID={KEYBOARD_DONE_ID}
        className="rounded-[14px] border border-line/20 bg-surface px-4 py-3.5 font-hk-medium text-[15px] text-ink"
        style={{
          minHeight: multiline ? 64 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export default function ProfilBearbeiten() {
  const router = useRouter();
  const t = useT();
  const profile = useProfile();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [uploading, setUploading] = useState(false);
  const INITIALS = initialsFromName(name);

  // Pick a photo, upload it to Storage, store the URL on the profile.
  const changePhoto = async () => {
    if (uploading) return;
    setUploading(true);
    let uid = "guest";
    if (hasSupabase) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id ?? "guest";
    }
    const url = await pickAndUploadAvatar(uid);
    setUploading(false);
    if (url) await profile.saveAvatar(url);
  };

  const onSave = async () => {
    // Normalize the username to a @handle (unless left empty).
    const handle = username.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
    await profile.save({
      name: name.trim(),
      username: handle ? `@${handle}` : "",
      bio: bio.trim(),
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-3.5 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill border border-line/[0.18]"
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-[28px] text-ink">{t("Edit profile", "Profil bearbeiten")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar with change-photo */}
        <View className="mb-5 items-center">
          <Pressable onPress={changePhoto} className="h-[84px] w-[84px]">
            <View className="h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-pill bg-night-2">
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={{ width: 84, height: 84 }}
                  contentFit="cover"
                />
              ) : (
                <>
                  <StripeTexture />
                  <Text className="font-hk-extrabold-italic text-[26px] text-screen">
                    {INITIALS}
                  </Text>
                </>
              )}
            </View>
            <View
              className="absolute -bottom-0.5 -right-0.5 h-[30px] w-[30px] items-center justify-center rounded-pill border-[3px] border-screen bg-accent"
            >
              <Text className="text-[13px] text-accent-ink">✎</Text>
            </View>
          </Pressable>
          <Pressable onPress={changePhoto} disabled={uploading}>
            <Text className="mt-2.5 font-hk-semibold text-[12px] text-ink underline">
              {uploading
                ? t("Uploading …", "Wird hochgeladen …")
                : t("Change photo", "Foto ändern")}
            </Text>
          </Pressable>
        </View>

        {/* Fields */}
        <View className="gap-3.5">
          <Field label={t("NAME", "NAME")} value={name} onChangeText={setName} />
          <Field label={t("USERNAME", "BENUTZERNAME")} value={username} onChangeText={setUsername} />
          <Field label={t("BIO", "BIO")} value={bio} onChangeText={setBio} multiline />
        </View>

        {/* Save (at the bottom) */}
        <View className="flex-1" />
        <Pressable
          onPress={onSave}
          className="mt-8 items-center rounded-[16px] bg-accent py-4"
        >
          <Text className="font-hk-extrabold text-[17px] text-accent-ink">{t("Save", "Speichern")}</Text>
        </Pressable>
      </ScrollView>

      {/* "Done" bar above the keyboard (iOS) for the input fields */}
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
