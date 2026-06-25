import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { shadows } from "../theme";
import { GoogleLogo } from "./Logos";

// Bottom-Sheet zum „Exportieren" der gemerkten Orte nach Google Maps.
// Hinweis: Google Maps hat KEINE öffentliche API, um Orte in eine Nutzer-Liste
// zu schreiben — ein echter Export bräuchte Backend + OAuth. Im MVP ist das
// (wie der Login) ein MOCK-Flow: „Konto verknüpfen" -> Erfolgs-Anzeige.
// Die Zielliste heißt „?" (passend zum Insider-Ton).

export function GoogleExportSheet({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);

  return (
    <View className="absolute inset-0 justify-end" style={{ zIndex: 20 }}>
      {/* Abgedunkelter Hintergrund — Tippen schließt */}
      <Pressable onPress={onClose} className="absolute inset-0 bg-night/50" />

      <View className="rounded-t-sheet bg-screen px-6 pb-10 pt-6" style={shadows.card}>
        {done ? (
          <>
            <Text className="font-hk-extrabold text-[24px] text-ink">
              Exportiert ✓
            </Text>
            <Text className="mt-2 font-hk-medium text-[14px] leading-[20px] text-ink-2">
              {count} {count === 1 ? "Ort liegt" : "Orte liegen"} jetzt in deiner
              Google-Maps-Liste „?". Öffne Google Maps → Gespeichert → „?".
            </Text>
            <Pressable
              onPress={onClose}
              className="mt-6 items-center rounded-[18px] bg-night py-4"
            >
              <Text className="font-hk-extrabold text-[16px] text-screen">Fertig</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-2">
              <GoogleLogo size={20} />
              <Text className="font-hk-extrabold text-[22px] text-ink">
                Nach Google Maps
              </Text>
            </View>
            <Text className="mt-2 font-hk-medium text-[14px] leading-[20px] text-ink-2">
              Verknüpfe dein Google-Konto, um deine {count} gemerkten Orte als
              Liste „?" nach Google Maps zu exportieren.
            </Text>
            <Pressable
              onPress={() => setDone(true)}
              className="mt-6 flex-row items-center justify-center gap-2 rounded-[18px] bg-night py-4"
            >
              <GoogleLogo size={18} />
              <Text className="font-hk-extrabold text-[15px] text-screen">
                Konto verknüpfen & exportieren
              </Text>
            </Pressable>
            <Pressable onPress={onClose} className="mt-3 items-center py-2">
              <Text className="font-hk-semibold text-[14px] text-ink-3">
                Abbrechen
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
