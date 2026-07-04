import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KEYBOARD_DONE_ID, KeyboardDoneBar } from "../src/components/KeyboardDoneBar";
import { Pill } from "../src/components/Pill";
import { CATEGORY_ORDER, categoryFilters } from "../src/data/categories";
import type { Category } from "../src/data/types";
import { useLang, useT } from "../src/lib/i18n";
import { PIN_COLORS } from "../src/lib/pinColors";
import { submitSpotSuggestion } from "../src/lib/suggestions";
import { useCity } from "../src/store/city";

// Submit a place for editorial review. Opened from the "+" on the map. Writes to
// the `spot_suggestions` table (fail-soft) and shows a thank-you state. Bilingual.

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
      {children}
    </Text>
  );
}

export default function OrtVorschlagen() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const { city } = useCity();

  // Optional prefill (e.g. handed over from the TikTok/Instagram share import).
  const params = useLocalSearchParams<{
    name?: string;
    category?: string;
    area?: string;
    note?: string;
    from?: string;
  }>();
  const prefillCategory =
    params.category && params.category in CATEGORY_ORDER
      ? (params.category as Category)
      : null;
  const fromShare = params.from === "share";

  const [name, setName] = useState(params.name ?? "");
  const [category, setCategory] = useState<Category | null>(prefillCategory);
  const [area, setArea] = useState(params.area ?? "");
  const [note, setNote] = useState(params.note ?? "");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const canSubmit = name.trim().length > 0 && !busy;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    await submitSpotSuggestion({ name, category, area, note, city });
    setBusy(false);
    setSent(true);
  };
  // Category pills (all categories, with their leading icon); single-select.
  const cats = categoryFilters(lang).filter((f) => f.key !== null);

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-[84px] w-[84px] items-center justify-center rounded-pill bg-accent">
            <Text className="font-hk-extrabold text-[36px] text-accent-ink">✓</Text>
          </View>
          <Text className="mt-7 text-center font-hk-extrabold-italic text-[24px] leading-[30px] text-ink">
            {t("Thanks — gem received.", "Danke — Tipp ist da.")}
          </Text>
          <Text className="mt-3 max-w-[300px] text-center font-hk-medium text-[14px] leading-[21px] text-ink-2">
            {t(
              "Our editors will take a quiet look. If it fits Verso, it shows up in a future drop.",
              "Unsere Redaktion schaut in Ruhe drauf. Passt er zu Verso, taucht er in einem kommenden Drop auf.",
            )}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-8 w-full items-center rounded-[18px] bg-night py-4"
          >
            <Text className="font-hk-extrabold text-[16px] text-white">
              {t("Done", "Fertig")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setName("");
              setCategory(null);
              setArea("");
              setNote("");
              setSent(false);
            }}
            className="mt-3 items-center py-1"
          >
            <Text className="font-hk-semibold text-[12px] text-ink-3">
              {t("Submit another", "Noch einen vorschlagen")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          {t("Submit a place", "Ort vorschlagen")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Draft-from-share banner (AI transparency: label it, ask to review). */}
        {fromShare ? (
          <View className="mb-4 rounded-[14px] bg-chip px-4 py-3">
            <Text className="font-hk-bold text-[12px] text-ink">
              {t("✨ Draft from a shared post", "✨ Entwurf aus einem geteilten Beitrag")}
            </Text>
            <Text className="mt-1 font-hk-medium text-[12px] leading-[17px] text-ink-2">
              {t(
                "We pre-filled this from the post you shared. Please check it before sending.",
                "Wir haben das aus deinem geteilten Beitrag vorausgefüllt. Bitte prüf es vor dem Senden.",
              )}
            </Text>
          </View>
        ) : (
          <Text className="mb-5 font-hk-medium-italic text-[14px] leading-[21px] text-ink-2">
            {t(
              "Know a place worth knowing? Send it to our editors — real tips, no business directory.",
              "Kennst du einen Ort, den man kennen sollte? Schick ihn der Redaktion — echte Tipps, kein Branchenverzeichnis.",
            )}
          </Text>
        )}

        {/* Shortcut: draft from a TikTok/Instagram post instead of typing. */}
        {!fromShare ? (
          <Pressable
            onPress={() => router.push("/share-import")}
            className="mb-5 flex-row items-center justify-between rounded-[14px] border border-line/10 bg-surface px-4 py-3.5"
          >
            <View className="flex-1 pr-3">
              <Text className="font-hk-extrabold text-[14px] text-ink">
                {t("Import from TikTok / Instagram", "Aus TikTok / Instagram importieren")}
              </Text>
              <Text className="mt-0.5 font-hk-medium text-[12px] text-ink-3">
                {t(
                  "Paste a post link and we draft the suggestion.",
                  "Beitrags-Link einfügen — wir entwerfen den Vorschlag.",
                )}
              </Text>
            </View>
            <Text className="text-[18px]">✨</Text>
          </Pressable>
        ) : null}

        <FieldLabel>{t("NAME", "NAME")}</FieldLabel>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t("e.g. Kellerkind", "z. B. Kellerkind")}
          placeholderTextColor="#8A857C"
          className="rounded-[14px] border border-line/10 bg-surface px-4 py-3.5 font-hk-medium text-[15px] text-ink"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />

        <View className="mt-5">
          <FieldLabel>{t("CATEGORY", "KATEGORIE")}</FieldLabel>
          <View className="flex-row flex-wrap gap-2">
            {cats.map((f) => {
              const key = f.key as Category;
              const col = PIN_COLORS[key];
              return (
                <Pill
                  key={f.label}
                  label={f.label}
                  active={category === key}
                  onPress={() => setCategory((c) => (c === key ? null : key))}
                  activeColor={col.oval}
                  activeTextColor={col.inner}
                />
              );
            })}
          </View>
        </View>

        <View className="mt-5">
          <FieldLabel>{t("AREA / ADDRESS", "VIERTEL / ADRESSE")}</FieldLabel>
          <TextInput
            value={area}
            onChangeText={setArea}
            placeholder={t("Neighborhood or street", "Viertel oder Straße")}
            placeholderTextColor="#8A857C"
            className="rounded-[14px] border border-line/10 bg-surface px-4 py-3.5 font-hk-medium text-[15px] text-ink"
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
        </View>

        <View className="mt-5">
          <FieldLabel>{t("WHY IT'S SPECIAL", "WARUM BESONDERS")}</FieldLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t(
              "The one detail that makes it a gem …",
              "Das eine Detail, das ihn zum Geheimtipp macht …",
            )}
            placeholderTextColor="#8A857C"
            multiline
            className="h-[110px] rounded-[14px] border border-line/10 bg-surface px-4 py-3.5 font-hk-medium text-[15px] text-ink"
            style={{ textAlignVertical: "top" }}
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          className="mt-7 items-center rounded-[18px] py-4"
          style={{ backgroundColor: canSubmit ? "#1A1A1A" : "rgba(26,26,26,0.25)" }}
        >
          <Text className="font-hk-extrabold text-[16px] text-white">
            {busy
              ? t("Sending …", "Wird gesendet …")
              : t("Send to editors", "An die Redaktion senden")}
          </Text>
        </Pressable>
      </ScrollView>

      <KeyboardDoneBar />
    </SafeAreaView>
  );
}
