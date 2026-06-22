import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Screen 07d — Passwort ändern (reine UI, keine echte Logik im MVP).

// Passwort-Eingabefeld, optional mit "Zeigen"-Umschalter.
function PwField({
  label,
  value,
  onChangeText,
  showToggle,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Text className="mb-1.5 font-hk-semibold text-[10px] tracking-[1.5px] text-ink-3">
        {label}
      </Text>
      <View
        className="flex-row items-center justify-between rounded-[14px] bg-surface px-4"
        style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.2)" }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder="••••••••"
          placeholderTextColor="#8A857C"
          className="flex-1 py-3.5 font-hk-medium text-[16px] text-ink"
        />
        {showToggle ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Text className="font-hk-semibold text-[11px] tracking-[0.5px] text-ink-3">
              {visible ? "VERBERGEN" : "ZEIGEN"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function PasswortAendern() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-screen" edges={["top", "bottom"]}>
      {/* Topbar */}
      <View className="flex-row items-center gap-3.5 px-6 pb-3.5 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="h-[42px] w-[42px] items-center justify-center rounded-pill"
          style={{ borderWidth: 1, borderColor: "rgba(26,26,26,0.18)" }}
        >
          <Text className="font-hk-extrabold text-[18px] text-ink">←</Text>
        </Pressable>
        <Text className="font-hk-extrabold text-[28px] text-ink">Passwort ändern</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3.5">
          <PwField
            label="AKTUELLES PASSWORT"
            value={current}
            onChangeText={setCurrent}
            showToggle
          />
          <PwField label="NEUES PASSWORT" value={next} onChangeText={setNext} />
          <PwField
            label="NEUES PASSWORT BESTÄTIGEN"
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <Text className="mt-3.5 font-hk-medium text-[12px] leading-[18px] text-ink-2">
          Mindestens 8 Zeichen, davon eine Zahl und ein Sonderzeichen.
        </Text>
        <Text className="mt-4 self-start font-hk-semibold text-[12px] text-ink underline">
          Passwort vergessen?
        </Text>

        {/* Aktualisieren (unten) */}
        <View className="flex-1" />
        <Pressable
          onPress={() => router.back()}
          className="mt-8 items-center rounded-[16px] bg-accent py-4"
        >
          <Text className="font-hk-extrabold text-[17px] text-accent-ink">
            Passwort aktualisieren
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
