import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Share, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleExportSheet } from "../src/components/GoogleExportSheet";
import { CityDropdown } from "../src/components/CityDropdown";
import { ImagePlaceholder } from "../src/components/ImagePlaceholder";
import { GoogleLogo } from "../src/components/Logos";
import { Pill } from "../src/components/Pill";
import { SceneToggle } from "../src/components/SceneToggle";
import { CATEGORY_LABEL, sortByCategory } from "../src/data/categories";
import { SPOTS } from "../src/data/spots";
import type { Category, Spot } from "../src/data/types";
import { PIN_COLORS } from "../src/lib/pinColors";
import { SCENE_CATEGORIES, SCENE_FILTERS } from "../src/lib/scene";
import { useCity } from "../src/store/city";
import { useSaved } from "../src/store/saved";
import { useScene } from "../src/store/scene";
import { shadows } from "../src/theme";

// Screen 06 — Gespeichert.
// Liste der gemerkten Orte (gefüllt über den "Merken"-Toggle im Detail).
// Wie in der Mail-App: Karte nach LINKS wischen -> löschen, nach RECHTS -> teilen.

// Eine wischbare Zeile.
function SavedRow({ spot }: { spot: Spot }) {
  const router = useRouter();
  const { toggle } = useSaved();
  const ref = useRef<Swipeable>(null);
  // Merkt, ob die Zeile offen ist (z. B. nach dem Teilen). Dann schließt ein
  // Tipp nur die Zeile, statt zur Detailseite zu navigieren.
  const openRef = useRef(false);

  const onShare = () => {
    Share.share({
      message: `${spot.name} — ${spot.hook}\nGefunden auf Verso: https://verso.app`,
    }).catch(() => {});
  };

  // Hinter der Zeile sichtbare Aktionen beim Wischen.
  const renderLeft = () => (
    <View className="my-1 mr-2 w-28 items-center justify-center rounded-card bg-accent">
      <Text className="text-[20px] text-accent-ink">↗</Text>
      <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
        TEILEN
      </Text>
    </View>
  );
  const renderRight = () => (
    <View className="my-1 ml-2 w-28 items-center justify-center rounded-card bg-[#E2402F]">
      <Text className="text-[18px] text-white">✕</Text>
      <Text className="mt-1 font-hk-bold text-[11px] tracking-[1px] text-white">
        LÖSCHEN
      </Text>
    </View>
  );

  return (
    <Swipeable
      ref={ref}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
      renderLeftActions={renderLeft}
      renderRightActions={renderRight}
      onSwipeableWillOpen={() => {
        openRef.current = true;
      }}
      onSwipeableClose={() => {
        openRef.current = false;
      }}
      onSwipeableOpen={(direction) => {
        // direction "right" = nach links gewischt -> Löschen-Aktion (rechts).
        // direction "left"  = nach rechts gewischt -> Teilen-Aktion (links).
        if (direction === "right") {
          toggle(spot.id); // entfernt aus den gemerkten Orten
        } else {
          onShare();
          // Zeile bleibt offen -> der nächste Tipp schließt sie nur (kein Sprung
          // zur Detailseite). Erst danach navigiert ein Tipp wieder normal.
        }
      }}
      containerStyle={{ marginBottom: 8 }}
    >
      <Pressable
        onPress={() => {
          if (openRef.current) {
            ref.current?.close();
            return;
          }
          router.push(`/spot/${spot.id}`);
        }}
        className="flex-row items-center bg-screen py-2"
      >
        <ImagePlaceholder tone={spot.tone} height={64} radius={16} style={{ width: 64 }} />
        <View className="ml-4 flex-1">
          <Text className="font-hk-bold text-[10px] tracking-[1px] text-ink-3">
            {CATEGORY_LABEL[spot.category]} · {spot.neighborhood.toUpperCase()}
          </Text>
          <Text className="mt-0.5 font-hk-extrabold text-[18px] text-ink">
            {spot.name}
          </Text>
          <Text className="mt-0.5 font-hk-medium-italic text-[13px] text-ink-2">
            {spot.hook}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function Gespeichert() {
  const router = useRouter();
  const { savedIds } = useSaved();
  const { scene } = useScene();
  const { city } = useCity();
  const [exportOpen, setExportOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Beim Szenenwechsel die Kategorie-Auswahl zurücksetzen.
  useEffect(() => setActiveCategory(null), [scene]);

  // Reihenfolge der gemerkten Spots beibehalten.
  const saved = savedIds
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => Boolean(s));

  // Nach Stadt (Dropdown) -> Szene -> Hotbar-Kategorie filtern, nach Art gruppieren.
  const shown = sortByCategory(
    saved
      .filter((s) => s.city === city)
      .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
      .filter((s) => (activeCategory ? s.category === activeCategory : true)),
  );

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar: zurück links, Szenen-Toggle rechts */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-pill bg-chip"
        >
          <Text className="font-hk-bold text-[18px] text-ink">←</Text>
        </Pressable>
        <SceneToggle />
      </View>

      {/* Stadt-Dropdown statt „Deine Orte"; Anzahl-Badge rechts */}
      <CityDropdown
        right={
          <View className="rounded-pill bg-accent px-3 py-1.5">
            <Text className="font-hk-bold text-[11px] tracking-[1px] text-accent-ink">
              {shown.length} ORTE
            </Text>
          </View>
        }
      />

      {saved.length === 0 ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Text className="mt-10 font-hk-medium-italic text-[15px] leading-[22px] text-ink-3">
            Noch nichts gemerkt. Tipp im Detail eines Ortes auf „Merken +" — dann
            landet er hier.
          </Text>
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <SavedRow spot={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 96, // Platz für den Export-Button unten rechts
          }}
          ListHeaderComponent={
            <View>
              {/* Kategorie-Hotbar (Auswahl der Spots), Farben pro Kategorie */}
              <View className="-mx-6 mt-4">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
                >
                  {SCENE_FILTERS[scene].map((f) => {
                    const col = f.key ? PIN_COLORS[f.key] : null;
                    return (
                      <Pill
                        key={f.label}
                        label={f.label}
                        active={activeCategory === f.key}
                        onPress={() => setActiveCategory(f.key)}
                        activeColor={col?.oval}
                        activeTextColor={col?.inner}
                      />
                    );
                  })}
                </ScrollView>
              </View>

              {/* Wisch-Hinweis */}
              <Text className="mt-3 font-hk-medium text-[12px] text-ink-3">
                Wische eine Karte: → teilen, ← löschen.
              </Text>
              <View style={{ height: 16 }} />
            </View>
          }
          ListEmptyComponent={
            <Text className="mt-2 font-hk-medium-italic text-[15px] text-ink-3">
              Hier ist gerade nichts gemerkt — wechsle Stadt, Szene oder Kategorie.
            </Text>
          }
        />
      )}

      {/* Export nach Google Maps — unten rechts (nur wenn es Orte gibt) */}
      {saved.length > 0 ? (
        <Pressable
          onPress={() => setExportOpen(true)}
          className="absolute flex-row items-center gap-2 rounded-pill bg-night px-4 py-3"
          style={[{ bottom: 26, right: 20, zIndex: 10 }, shadows.card]}
        >
          <GoogleLogo size={18} />
          <Text className="font-hk-bold text-[13px] text-screen">
            Nach Google Maps exportieren
          </Text>
        </Pressable>
      ) : null}

      {exportOpen ? (
        <GoogleExportSheet
          count={saved.length}
          onClose={() => setExportOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}
