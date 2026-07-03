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
              "Your trust is the product — we never sell your data and there are no ads in the feed. To run your account, Verso processes: your email and login, your profile (name, username, bio, optional photo), your saved places, vibes and picked-up hidden gems, and — only if you allow it — anonymous, non-personal usage stats. Processors: Supabase (backend/auth), RevenueCat (Insider subscription), Apple/Google (login & payments). You can export or delete your account any time (Settings → Delete account).",
              "Dein Vertrauen ist das Produkt — wir verkaufen deine Daten nie, und im Feed gibt es keine Werbung. Für dein Konto verarbeitet Verso: E-Mail und Login, dein Profil (Name, Username, Bio, optionales Foto), deine gespeicherten Orte, Vibes und abgeholten Geheimtipps und — nur mit deiner Zustimmung — anonyme, nicht-personenbezogene Nutzungsstatistiken. Auftragsverarbeiter: Supabase (Backend/Auth), RevenueCat (Insider-Abo), Apple/Google (Login & Zahlung). Du kannst dein Konto jederzeit exportieren oder löschen (Einstellungen → Konto löschen).",
            )}
          </P>
          <View className="mt-2">
            <P>
              {t(
                "This is a plain-language summary. The full, legally binding privacy policy (incl. legal bases, retention and your GDPR rights) is published at verso.app/privacy before launch.",
                "Dies ist eine Zusammenfassung in einfacher Sprache. Die vollständige, rechtsverbindliche Datenschutzerklärung (inkl. Rechtsgrundlagen, Speicherfristen und deinen DSGVO-Rechten) wird vor dem Launch unter verso.app/datenschutz veröffentlicht.",
              )}
            </P>
          </View>
        </Section>

        {/* AI TRANSPARENCY (EU AI Act, Art. 50) */}
        <Section label={t("AI FEATURES", "KI-FUNKTIONEN")}>
          <P>
            {t(
              "Verso uses (or will use) AI to help suggest places — for example when you share a TikTok or Instagram post to Verso, an assistant drafts a spot suggestion from it. AI-assisted content is marked as such, always reviewed before it goes live, and you can ignore or edit any suggestion. We tell you this in the spirit of the EU AI Act's transparency rules.",
              "Verso nutzt (bzw. wird nutzen) KI, um Orte vorzuschlagen — etwa wenn du einen TikTok- oder Instagram-Beitrag an Verso teilst, entwirft ein Assistent daraus einen Ortsvorschlag. KI-gestützte Inhalte werden als solche gekennzeichnet, vor der Veröffentlichung immer geprüft, und du kannst jeden Vorschlag ignorieren oder bearbeiten. Wir weisen dich im Sinne der Transparenzpflichten der EU-KI-Verordnung darauf hin.",
            )}
          </P>
        </Section>

        {/* TERMS */}
        <Section label={t("TERMS OF USE", "NUTZUNGSBEDINGUNGEN")}>
          <P>
            {t(
              "Verso is a curated discovery guide, not a booking platform. Recommendations are editorial and never paid for. When you suggest a place (or share a post to Verso), you confirm you may share that content and grant Verso a licence to use it for the guide; we may edit or decline suggestions. Use the tips respectfully — the places are real, and so are the people who run them. The full terms are published at verso.app/terms.",
              "Verso ist ein kuratierter Entdeckungs-Guide, keine Buchungsplattform. Empfehlungen sind redaktionell und niemals bezahlt. Wenn du einen Ort vorschlägst (oder einen Beitrag an Verso teilst), bestätigst du, dass du diesen Inhalt teilen darfst, und räumst Verso eine Lizenz zur Nutzung im Guide ein; wir dürfen Vorschläge bearbeiten oder ablehnen. Nutze die Tipps mit Respekt — die Orte sind echt, und die Menschen dahinter auch. Die vollständigen Bedingungen findest du unter verso.app/agb.",
            )}
          </P>
        </Section>

        {/* SUBSCRIPTION & WITHDRAWAL (EU consumer law) */}
        <Section label={t("SUBSCRIPTION & WITHDRAWAL", "ABO & WIDERRUF")}>
          <P>
            {t(
              "Verso Insider is an auto-renewing subscription (monthly or yearly). The price and term are shown on the Insider page before you buy; payment is charged to your Apple ID and renews unless you cancel at least 24 h before the period ends. Manage or cancel any time in the App Store (Settings → Apple ID → Subscriptions).",
              "Verso Insider ist ein automatisch verlängerndes Abo (monatlich oder jährlich). Preis und Laufzeit siehst du vor dem Kauf auf der Insider-Seite; die Zahlung läuft über deine Apple-ID und verlängert sich, sofern du nicht mindestens 24 Std. vor Ablauf kündigst. Verwalten/Kündigen jederzeit im App Store (Einstellungen → Apple-ID → Abonnements).",
            )}
          </P>
          <View className="mt-2">
            <P>
              {t(
                "Right of withdrawal: as a consumer you have a 14-day right to withdraw from a digital purchase. By starting the subscription and asking for immediate access, you agree that provision begins at once and acknowledge that your right of withdrawal lapses once the service has been fully provided. This is a placeholder notice — the binding withdrawal policy follows at verso.app/withdrawal.",
                "Widerrufsbelehrung: Als Verbraucher:in hast du ein 14-tägiges Widerrufsrecht für digitale Käufe. Mit Beginn des Abos und dem Wunsch nach sofortigem Zugang stimmst du zu, dass die Ausführung sofort beginnt, und bestätigst, dass dein Widerrufsrecht mit vollständiger Erbringung der Leistung erlischt. Dies ist ein Platzhalter — die verbindliche Widerrufsbelehrung folgt unter verso.app/widerruf.",
              )}
            </P>
          </View>
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
