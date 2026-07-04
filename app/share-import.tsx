import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KEYBOARD_DONE_ID, KeyboardDoneBar } from "../src/components/KeyboardDoneBar";
import { track } from "../src/lib/analytics";
import { useT } from "../src/lib/i18n";
import { parseSharedPost } from "../src/lib/shareImport";

// Receives a shared TikTok/Instagram post (via deep link `verso://share-import?
// text=…`, or pasted here) and drafts a spot suggestion from it, then hands the
// draft to the "Submit a place" form for review + send.
//
// The DRAFT is produced by a MOCK parser today (src/lib/shareImport.ts) — no AI
// yet. When AI is wired in, this screen and the parser stay the same shape; the
// draft is already labelled as assisted so the user reviews before sending.
//
// NOTE: a real system-share-sheet entry ("Share to Verso" from inside TikTok/
// Instagram) needs a native iOS Share Extension target + config plugin and a
// Dev Build. That extension would simply open this route with the shared text.

export default function ShareImport() {
  const router = useRouter();
  const t = useT();
  const params = useLocalSearchParams<{ text?: string; url?: string }>();
  const initial = params.text ?? params.url ?? "";
  const [text, setText] = useState(initial);

  const draft = () => {
    const d = parseSharedPost(text);
    track("share_import_draft", { source: d.source });
    router.replace({
      pathname: "/ort-vorschlagen",
      params: {
        name: d.name,
        category: d.category ?? "",
        area: d.city ?? "",
        note: d.note,
        from: "share",
      },
    });
  };

  const canDraft = text.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-2 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Close", "Schließen")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill border border-line/[0.18]"
        >
          <Text className="font-hk-extrabold text-[16px] text-ink">✕</Text>
        </Pressable>
        <Text
          className="font-hk-extrabold text-title-md text-ink"
          style={{ lineHeight: 38, includeFontPadding: false }}
        >
          {t("From social", "Aus Social")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-5 font-hk-medium-italic text-[14px] leading-[21px] text-ink-2">
          {t(
            "Share a TikTok or Instagram post to Verso, or paste its link + caption here. We'll draft a spot suggestion you can review.",
            "Teile einen TikTok- oder Instagram-Beitrag an Verso oder füge Link + Caption hier ein. Wir entwerfen einen Ortsvorschlag zum Prüfen.",
          )}
        </Text>

        <Text className="mb-2 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
          {t("POST LINK OR TEXT", "BEITRAGS-LINK ODER TEXT")}
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t(
            "https://tiktok.com/…  ☕️ best matcha in Munich @cafe.central",
            "https://tiktok.com/…  ☕️ bestes Matcha in München @cafe.central",
          )}
          placeholderTextColor="#8A857C"
          multiline
          className="h-[120px] rounded-[14px] border border-line/10 bg-surface px-4 py-3.5 font-hk-medium text-[15px] text-ink"
          style={{ textAlignVertical: "top" }}
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />

        {/* AI-transparency note (mock today; honest label). */}
        <Text className="mt-3 font-hk-medium text-[11px] leading-[16px] text-ink-3">
          {t(
            "We draft this automatically — always check it before sending. (Assisted feature.)",
            "Wir entwerfen das automatisch — prüf es immer vor dem Senden. (Assistiertes Feature.)",
          )}
        </Text>

        <Pressable
          onPress={draft}
          disabled={!canDraft}
          className="mt-6 items-center rounded-[18px] py-4"
          style={{ backgroundColor: canDraft ? "#1A1A1A" : "rgba(26,26,26,0.25)" }}
        >
          <Text className="font-hk-extrabold text-[16px] text-white">
            {t("Draft suggestion", "Entwurf erstellen")}
          </Text>
        </Pressable>
      </ScrollView>

      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
