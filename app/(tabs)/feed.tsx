import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { CityDropdown } from "../../src/components/CityDropdown";
import { ListMapToggle } from "../../src/components/ListMapToggle";
import { MapFilterSheet } from "../../src/components/MapFilterSheet";
import { Pill } from "../../src/components/Pill";
import { SceneToggle } from "../../src/components/SceneToggle";
import { SearchField } from "../../src/components/SearchField";
import { SpotCard } from "../../src/components/SpotCard";
import { SurpriseButton } from "../../src/components/SurpriseButton";
import { sortByCategory } from "../../src/data/categories";
import { SPOTS } from "../../src/data/spots";
import type { Category } from "../../src/data/types";
import { DEFAULT_FILTER, matchesFilter, type MapFilter } from "../../src/lib/mapFilter";
import { PIN_COLORS } from "../../src/lib/pinColors";
import { SCENE_CATEGORIES, SCENE_FILTERS } from "../../src/lib/scene";
import { useCity } from "../../src/store/city";
import { useInterests } from "../../src/store/interests";
import { useScene } from "../../src/store/scene";

// Trichter-Icon (Filter) — SVG, passt zum redaktionellen Ton (kein Emoji).
function FilterGlyph({ color = "#1A1A1A" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M3 5 H21 L14 13 V20 L10 18 V13 Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Screen 02 — Discovery-Feed.
// Oben unter dem Notch: Liste/Karte-Umschalter (zentriert) + Szenen-Toggle
// (rechts). Darunter Stadt-Dropdown und die szenenabhängige Kategorie-Bar.

export default function Feed() {
  const router = useRouter();
  const { city } = useCity();
  const { scene } = useScene();
  const { interests } = useInterests();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  // Budget/Bewertung/Ambiente-Filter (wie auf der Karte). „Art" macht hier die
  // Kategorie-Hotbar -> im Sheet ausgeblendet (showArt={false}).
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  // Beim Szenenwechsel die Kategorie-Auswahl zurücksetzen (sonst zeigt sie ggf.
  // eine Kategorie der anderen Szene -> leer).
  useEffect(() => setActiveCategory(null), [scene]);

  // Sind Budget/Bewertung/Ambiente vom Default abweichend gesetzt? (art = Hotbar)
  const filterActive =
    filter.minPrice > 0 ||
    filter.maxPrice < 100 ||
    filter.minRating > 0 ||
    filter.ambiente.length > 0;

  // Filter: Stadt -> Szene (Kategoriengruppe) -> optional gewählte Kategorie ->
  // optional Suchtext (Name/Viertel/Tag) -> Budget/Bewertung/Ambiente. Danach
  // nach Art gruppieren (sortByCategory), damit die Liste nicht chaotisch ist.
  const q = query.trim().toLowerCase();
  const visibleSpots = useMemo(
    () =>
      sortByCategory(
        SPOTS.filter((s) => s.city === city)
          .filter((s) => SCENE_CATEGORIES[scene].includes(s.category))
          .filter((s) => (activeCategory ? s.category === activeCategory : true))
          .filter((s) =>
            q
              ? s.name.toLowerCase().includes(q) ||
                s.neighborhood.toLowerCase().includes(q) ||
                s.tags.some((t) => t.toLowerCase().includes(q))
              : true,
          )
          .filter((s) => matchesFilter(s, filter)),
      ),
    [city, scene, activeCategory, q, filter],
  );

  // Onboarding-Personalisierung: Spots, deren Ambiente einen der gewählten Vibes
  // trifft, sanft nach oben (stabil — Array.sort ist in Hermes stabil, also
  // bleibt die Kategorie-Reihenfolge innerhalb der Gruppen erhalten). Nichts
  // wird ausgeblendet; ohne gewählte Vibes bleibt alles wie es ist.
  const personalizedSpots = useMemo(() => {
    if (interests.length === 0) return visibleSpots;
    const fits = (s: (typeof visibleSpots)[number]) =>
      s.ambience.some((a) => interests.includes(a));
    return [...visibleSpots].sort((a, b) => Number(fits(b)) - Number(fits(a)));
  }, [visibleSpots, interests]);

  // „Überrasch mich" zieht aus dem breiten Stadt+Szene-Pool (bewusst NICHT aus
  // der gefilterten Liste — sonst wär's keine Überraschung).
  const surprisePool = useMemo(
    () =>
      SPOTS.filter(
        (s) => s.city === city && SCENE_CATEGORIES[scene].includes(s.category),
      ),
    [city, scene],
  );
  const onSurprise = () => {
    if (surprisePool.length === 0) return;
    const pick = surprisePool[Math.floor(Math.random() * surprisePool.length)];
    router.push(`/spot/${pick.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top"]}>
      {/* Eine Kopfzeile: Wien links, Liste/Karte zentriert, Szene rechts */}
      <CityDropdown
        center={<ListMapToggle active="liste" />}
        right={<SceneToggle />}
      />

      {/* Suchfeld (Name/Viertel/Tag) + Filter-Button (Budget/Bewertung/Ambiente) */}
      <View className="mt-3 flex-row items-center gap-2 px-6">
        <View className="flex-1">
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Ort, Viertel oder Tag suchen …"
          />
        </View>
        <Pressable
          onPress={() => setFilterOpen(true)}
          accessibilityLabel="Filter öffnen"
          className={`h-11 w-11 items-center justify-center rounded-pill ${
            filterActive ? "bg-accent" : "bg-chip"
          }`}
        >
          <FilterGlyph color={filterActive ? "#1A1A1A" : "#6E6A63"} />
          {filterActive ? (
            <View className="absolute right-2 top-2 h-2 w-2 rounded-pill bg-night" />
          ) : null}
        </Pressable>
      </View>

      {/* Kategorie-Bar — szenenabhängig (Feiern: Bar/Club/Event, Essen: …). */}
      <View className="mt-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 8,
            paddingTop: 6,
            paddingBottom: 14,
          }}
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

      {/* Liste */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 110, // Platz für die schwebende Nav
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* „Überrasch mich" — zufälliger Ort (passt zum Geheimtipp-Kern) */}
        {surprisePool.length > 0 ? (
          <View className="mb-4">
            <SurpriseButton onPress={onSurprise} />
          </View>
        ) : null}

        {/* Dezenter Hinweis, wenn der Feed auf den Vibe abgestimmt ist */}
        {interests.length > 0 && !q ? (
          <Text className="mb-3 font-hk-semibold text-[11px] tracking-[1px] text-ink-3">
            ✦ AUF DEINEN VIBE ABGESTIMMT
          </Text>
        ) : null}

        {personalizedSpots.map((spot, i) => (
          <SpotCard key={spot.id} spot={spot} hintCandidate={i === 0} />
        ))}

        {personalizedSpots.length === 0 ? (
          <Text className="mt-10 text-center font-hk-medium-italic text-[15px] text-ink-3">
            {q || filterActive
              ? "Nichts passt zu Suche/Filter. Lockere die Kriterien."
              : "Hier kramen wir noch. Schau bald wieder rein."}
          </Text>
        ) : null}
      </ScrollView>

      {/* Filter-Sheet (oben angedockt). „Art" macht die Hotbar -> hier aus. */}
      {filterOpen ? (
        <MapFilterSheet
          filter={filter}
          setFilter={setFilter}
          count={visibleSpots.length}
          onClose={() => setFilterOpen(false)}
          showArt={false}
        />
      ) : null}
    </SafeAreaView>
  );
}
