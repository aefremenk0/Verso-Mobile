import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useT, useLang } from "../src/lib/i18n";
import { friendlyAuthError } from "../src/lib/errors";
import { track } from "../src/lib/analytics";
import { useInsider, type InsiderPackage } from "../src/store/insider";

// "Verso Insider" — upsell + paywall (modal). Dark stage with gold accents.
// Shows the value, then the yearly/monthly plans (yearly anchored as best value
// with a savings badge). Real purchase via RevenueCat in a dev build; in Expo Go
// / without configured products it falls back to the mock preview toggle.

const GOLD = "#F4C430";

// Prices are shown in EUR (the App Store storefront currency for the target
// market). The RevenueCat test store can report USD, so we format the numeric
// amount as EUR ourselves rather than using the store's localized string.
function fmtMoney(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} €`;
  }
}

// The price to show for a package: EUR-formatted numeric price, with the store's
// localized string as a fallback if we don't have a numeric price.
function priceText(price: number, priceString: string): string {
  return price > 0 ? fmtMoney(price) : priceString;
}

export default function Insider() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const {
    isInsider,
    setInsider,
    hasPaywall,
    packages,
    loading,
    purchase,
    restore,
  } = useInsider();

  const showPaywall = hasPaywall && packages.length > 0;

  // Identify plans; default-select the yearly (best value).
  const annual = packages.find((p) => p.packageType === "ANNUAL");
  const monthly = packages.find((p) => p.packageType === "MONTHLY");
  const [selectedId, setSelectedId] = useState<string>("");
  useEffect(() => {
    if (!selectedId && packages.length)
      setSelectedId((annual ?? packages[0]).id);
  }, [packages, annual, selectedId]);
  const selected =
    packages.find((p) => p.id === selectedId) ?? annual ?? packages[0];

  // Savings % of the yearly vs 12× monthly.
  const savingsPct = useMemo(() => {
    if (!annual || !monthly || monthly.price <= 0) return 0;
    return Math.round((1 - annual.price / 12 / monthly.price) * 100);
  }, [annual, monthly]);

  const [error, setError] = useState<string | null>(null);

  // Shimmering gold sparkle on the badge.
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmer]);
  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + shimmer.value * 0.5,
  }));

  // Log that the paywall was seen (once).
  useEffect(() => {
    track("paywall_view");
  }, []);

  const onBuy = async () => {
    if (!selected) return;
    setError(null);
    track("purchase_started", { plan: selected.packageType ?? "unknown" });
    const { error: err } = await purchase(selected.id);
    if (err) {
      setError(friendlyAuthError(err, lang));
      return;
    }
    track("purchase_success", { plan: selected.packageType ?? "unknown" });
    router.back();
  };
  const onRestore = async () => {
    setError(null);
    const { error: err } = await restore();
    if (err) setError(friendlyAuthError(err, lang));
  };

  const BENEFITS = [
    t("Sport & Live Events scenes", "Sport- & Live-Events-Szenen"),
    t("Early access to small events", "Früher Zugang zu kleinen Events"),
    t("Hidden places, Insiders only", "Verborgene Orte, nur für Insider"),
    t("Unlimited weekly gems", "Unbegrenzte Geheimtipps"),
    t("New cities first", "Neue Städte zuerst"),
  ];

  return (
    <SafeAreaView className="flex-1 bg-night" edges={["top", "bottom"]}>
      {/* Close */}
      <View className="flex-row justify-end px-6 pt-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t("Close", "Schließen")}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(247,244,239,0.22)" }}
        >
          <Text className="font-hk-extrabold text-[16px] text-white">✕</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gold badge */}
        <View className="mt-2 flex-row">
          <View
            className="flex-row items-center rounded-pill px-3.5 py-1.5"
            style={{
              backgroundColor: "rgba(244,196,48,0.14)",
              borderWidth: 1,
              borderColor: "rgba(244,196,48,0.5)",
            }}
          >
            <Animated.Text style={[{ fontSize: 12, color: GOLD }, sparkleStyle]}>
              ✦{" "}
            </Animated.Text>
            <Text
              className="font-hk-bold text-[11px] tracking-[2px]"
              style={{ color: GOLD }}
            >
              VERSO INSIDER
            </Text>
          </View>
        </View>

        {/* Headline */}
        <Text className="mt-5 font-hk-extrabold-italic text-[34px] leading-[38px] text-white">
          {t("Lift the curtain.", "Lüfte den Vorhang.")}
        </Text>
        <Text className="mt-3 font-hk-medium text-[15px] leading-[21px] text-white/65">
          {t(
            "Free stays generous. Insider opens the doors others don't get through.",
            "Free bleibt großzügig. Insider öffnet die Türen, durch die andere nicht kommen.",
          )}
        </Text>

        {/* Benefits */}
        <View className="mt-6 gap-3">
          {BENEFITS.map((b) => (
            <View key={b} className="flex-row items-center">
              <View
                className="mr-3 h-[22px] w-[22px] items-center justify-center rounded-pill"
                style={{ backgroundColor: "rgba(244,196,48,0.16)" }}
              >
                <Text style={{ color: GOLD, fontSize: 12 }}>✦</Text>
              </View>
              <Text className="flex-1 font-hk-semibold text-[15px] text-white">
                {b}
              </Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        {showPaywall ? (
          <View className="mt-7 gap-3">
            {packages.map((p) => (
              <PlanCard
                key={p.id}
                pkg={p}
                selected={selected?.id === p.id}
                bestValue={p.packageType === "ANNUAL"}
                savingsPct={p.packageType === "ANNUAL" ? savingsPct : 0}
                onPress={() => setSelectedId(p.id)}
                t={t}
              />
            ))}
          </View>
        ) : (
          <Text className="mt-7 text-center font-hk-medium text-[12px] text-white/40">
            {t(
              "Preview is a mock — real plans need a dev build with products.",
              "Vorschau ist ein Mock — echte Pläne brauchen einen Dev Build mit Produkten.",
            )}
          </Text>
        )}

        {error ? (
          <Text className="mt-4 text-center font-hk-medium text-[12px] text-[#FF8A7A]">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      {/* Sticky action area */}
      <View className="px-6 pb-6 pt-2">
        {isInsider ? (
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center justify-center rounded-[18px] py-4"
            style={{ backgroundColor: GOLD }}
          >
            <Text className="font-hk-extrabold text-[16px] text-night">
              {t("You're an Insider ✓", "Du bist Insider ✓")}
            </Text>
          </Pressable>
        ) : showPaywall ? (
          <>
            <Pressable
              onPress={onBuy}
              disabled={loading || !selected}
              className="items-center rounded-[18px] py-4"
              style={{ backgroundColor: GOLD, opacity: loading ? 0.7 : 1 }}
            >
              <Text className="font-hk-extrabold text-[16px] text-night">
                {loading
                  ? t("Please wait …", "Bitte warten …")
                  : selected?.hasTrial
                    ? t("Start free trial", "Kostenlos testen")
                    : t("Become an Insider", "Insider werden")}
              </Text>
              {selected ? (
                <Text className="mt-0.5 font-hk-medium text-[12px] text-night/70">
                  {(() => {
                    const p = priceText(selected.price, selected.priceString);
                    return selected.hasTrial ? t(`then ${p}`, `danach ${p}`) : p;
                  })()}
                </Text>
              ) : null}
            </Pressable>
            <Pressable onPress={onRestore} disabled={loading} className="mt-3 items-center py-1.5">
              <Text className="font-hk-semibold text-[12px] text-white/50">
                {t("Restore purchases", "Käufe wiederherstellen")}
              </Text>
            </Pressable>
            <Text className="mt-1 text-center font-hk-medium text-[10px] leading-[15px] text-white/35">
              {t(
                "Auto-renews until cancelled. Manage in the App Store.",
                "Verlängert sich automatisch bis zur Kündigung. Verwaltung im App Store.",
              )}
            </Text>
          </>
        ) : (
          // Mock preview (Expo Go / no products configured)
          <>
            <Pressable
              onPress={() => {
                if (!isInsider) setInsider(true);
                router.back();
              }}
              className="items-center rounded-[18px] py-4"
              style={{ backgroundColor: GOLD }}
            >
              <Text className="font-hk-extrabold text-[16px] text-night">
                {t("Turn on Insider preview", "Insider-Vorschau aktivieren")}
              </Text>
            </Pressable>
            <Pressable onPress={() => router.back()} className="mt-3 items-center py-1.5">
              <Text className="font-hk-semibold text-[12px] text-white/50">
                {t("Back to profile", "Zurück zum Profil")}
              </Text>
            </Pressable>
          </>
        )}

        {/* Terms + Privacy links at the point of purchase (App Store requirement). */}
        <View className="mt-3 flex-row items-center justify-center">
          <Pressable onPress={() => router.push("/legal")} hitSlop={8}>
            <Text className="font-hk-semibold text-[11px] text-white/45 underline">
              {t("Terms", "Nutzungsbedingungen")}
            </Text>
          </Pressable>
          <Text className="mx-2 text-[11px] text-white/30">·</Text>
          <Pressable onPress={() => router.push("/legal")} hitSlop={8}>
            <Text className="font-hk-semibold text-[11px] text-white/45 underline">
              {t("Privacy", "Datenschutz")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// One selectable plan card. Yellow ring + gold when selected; "best value" +
// savings badge on the yearly; per-month equivalent for the yearly.
function PlanCard({
  pkg,
  selected,
  bestValue,
  savingsPct,
  onPress,
  t,
}: {
  pkg: InsiderPackage;
  selected: boolean;
  bestValue: boolean;
  savingsPct: number;
  onPress: () => void;
  t: (en: string, de: string) => string;
}) {
  const isAnnual = pkg.packageType === "ANNUAL";
  const isMonthly = pkg.packageType === "MONTHLY";
  const periodLabel = isAnnual
    ? t("Yearly", "Jährlich")
    : isMonthly
      ? t("Monthly", "Monatlich")
      : pkg.title;
  const suffix = isAnnual
    ? "/" + t("year", "Jahr")
    : isMonthly
      ? "/" + t("month", "Monat")
      : "";
  const perMonth = isAnnual && pkg.price > 0 ? pkg.price / 12 : 0;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-card p-4"
      style={{
        backgroundColor: selected ? "rgba(244,196,48,0.12)" : "rgba(247,244,239,0.06)",
        borderWidth: 1.5,
        borderColor: selected ? GOLD : "rgba(247,244,239,0.14)",
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="font-hk-extrabold text-[17px] text-white">
            {periodLabel}
          </Text>
          {bestValue ? (
            <View className="ml-2 rounded-pill px-2 py-0.5" style={{ backgroundColor: GOLD }}>
              <Text className="font-hk-bold text-[9px] tracking-[1px] text-night">
                {t("BEST VALUE", "BESTER WERT")}
              </Text>
            </View>
          ) : null}
        </View>
        {savingsPct > 0 ? (
          <Text className="font-hk-bold text-[12px]" style={{ color: GOLD }}>
            {t(`Save ${savingsPct}%`, `–${savingsPct}%`)}
          </Text>
        ) : null}
      </View>

      <View className="mt-1 flex-row items-baseline">
        <Text className="font-hk-extrabold text-[20px] text-white">
          {priceText(pkg.price, pkg.priceString)}
        </Text>
        <Text className="ml-1 font-hk-medium text-[13px] text-white/55">
          {suffix}
        </Text>
      </View>

      {perMonth > 0 ? (
        <Text className="mt-0.5 font-hk-medium text-[12px] text-white/50">
          ≈ {fmtMoney(perMonth)} {t("/ month", "/ Monat")}
        </Text>
      ) : null}

      {pkg.hasTrial ? (
        <Text className="mt-1 font-hk-semibold text-[11px]" style={{ color: GOLD }}>
          {t("Free trial included", "Gratis-Test inklusive")}
        </Text>
      ) : null}
    </Pressable>
  );
}
