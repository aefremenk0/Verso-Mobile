import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useT } from "../src/lib/i18n";

// Legal & help (mock content, bilingual). Linked from Settings -> "Legal & help".
// All copy is placeholder in the Verso tone; no backend. Sections: help/FAQ,
// imprint, privacy, terms, contact.

// A titled block: caps label + body paragraph(s) inside a white card.
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
        {label}
      </Text>
      <View className="rounded-[18px] border border-line/[0.08] bg-surface px-4 py-4">
        {children}
      </View>
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text className="font-hk-medium text-[13.5px] leading-[21px] text-ink-2">
      {children}
    </Text>
  );
}

// A FAQ entry: bold question + answer.
function QA({ q, a }: { q: string; a: string }) {
  return (
    <View className="mb-3.5">
      <Text className="mb-1 font-hk-extrabold text-[14px] text-ink">{q}</Text>
      <Text className="font-hk-medium text-[13.5px] leading-[21px] text-ink-2">
        {a}
      </Text>
    </View>
  );
}

export default function Legal() {
  const router = useRouter();
  const t = useT();

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-4 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Back", "Zurück")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill border border-line/[0.18]"
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text
          className="font-hk-extrabold text-title-md text-ink"
          style={{ lineHeight: 38, includeFontPadding: false }}
        >
          {t("Legal & help", "Rechtliches & Hilfe")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 6,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 font-hk-medium-italic text-[14px] leading-[21px] text-ink-2">
          {t(
            "Everything you might want to look up — short and honest. (Placeholder text in the MVP.)",
            "Alles zum Nachschlagen — kurz und ehrlich. (Platzhalter-Text im MVP.)",
          )}
        </Text>

        {/* HELP / FAQ */}
        <Section label={t("HELP & FAQ", "HILFE & FAQ")}>
          <QA
            q={t(
              "How does the hidden gem of the week work?",
              "Wie funktioniert der Geheimtipp der Woche?",
            )}
            a={t(
              "Once a week you can pick up one curated spot for your city — tap the “?” in the bottom bar.",
              "Einmal pro Woche kannst du einen kuratierten Ort deiner Stadt abholen — tippe auf das „?“ in der unteren Leiste.",
            )}
          />
          <QA
            q={t(
              "How do I save a place?",
              "Wie speichere ich einen Ort?",
            )}
            a={t(
              "Long-press a card and tap the heart, or use “Save” on the detail page. Find everything again under “Saved”.",
              "Drücke lange auf eine Karte und tippe auf das Herz, oder nutze „Speichern“ auf der Detailseite. Alles findest du wieder unter „Gespeichert“.",
            )}
          />
          <QA
            q={t(
              "When do new cities arrive?",
              "Wann kommen neue Städte?",
            )}
            a={t(
              "Munich is the pilot. More cities follow step by step — Insiders get them first.",
              "München ist der Pilot. Weitere Städte folgen Schritt für Schritt — Insider bekommen sie zuerst.",
            )}
          />
        </Section>

        {/* IMPRINT */}
        <Section label={t("IMPRINT", "IMPRESSUM")}>
          <P>
            {t(
              "Verso GmbH (in formation)\nExample street 1, 80331 Munich, Germany\nManaging director: placeholder\nCommercial register: HRB 000000, Munich",
              "Verso GmbH (in Gründung)\nBeispielstraße 1, 80331 München, Deutschland\nGeschäftsführung: Platzhalter\nHandelsregister: HRB 000000, München",
            )}
          </P>
        </Section>

        {/* PRIVACY */}
        <Section label={t("PRIVACY", "DATENSCHUTZ")}>
          <P>
            {t(
              "Your trust is the product. In the MVP, Verso collects no personal data: no account sync, no tracking, no ads. Saved places and settings stay on your device. A full privacy policy follows before launch.",
              "Dein Vertrauen ist das Produkt. Im MVP erfasst Verso keine personenbezogenen Daten: kein Konto-Sync, kein Tracking, keine Werbung. Gespeicherte Orte und Einstellungen bleiben auf deinem Gerät. Eine vollständige Datenschutzerklärung folgt vor dem Launch.",
            )}
          </P>
        </Section>

        {/* TERMS */}
        <Section label={t("TERMS OF USE", "NUTZUNGSBEDINGUNGEN")}>
          <P>
            {t(
              "Verso is a curated discovery guide, not a booking platform. Recommendations are editorial and never paid for. Use the tips respectfully — the places are real, and so are the people who run them.",
              "Verso ist ein kuratierter Entdeckungs-Guide, keine Buchungsplattform. Empfehlungen sind redaktionell und niemals bezahlt. Nutze die Tipps mit Respekt — die Orte sind echt, und die Menschen dahinter auch.",
            )}
          </P>
        </Section>

        {/* CONTACT */}
        <Section label={t("CONTACT", "KONTAKT")}>
          <P>
            {t(
              "Questions, a spot worth knowing, or feedback?\nWrite to hello@verso.app — a real person reads it.",
              "Fragen, ein Ort, den man kennen sollte, oder Feedback?\nSchreib an hello@verso.app — da liest ein echter Mensch mit.",
            )}
          </P>
        </Section>

        <Text className="mt-1 text-center font-hk-semibold text-[11px] text-ink/40">
          {t(
            "Verso · Version 0.1 · Made in Munich",
            "Verso · Version 0.1 · Made in Munich",
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
