import { Text, View } from "react-native";
import { useT } from "../lib/i18n";
import { passwordChecks } from "../lib/password";

// Live password-requirement checklist. Each rule shows a ✓ (met, green) or a
// ○ (not yet, muted) as the user types. Mirrors the Supabase policy.
// Pass the current password; renders nothing until the user starts typing.

const MET = "#2E8B57"; // sea green
const UNMET = "#8A857C"; // muted

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View className="flex-row items-center" style={{ marginTop: 3 }}>
      <Text style={{ color: ok ? MET : UNMET, fontSize: 12, width: 16 }}>
        {ok ? "✓" : "○"}
      </Text>
      <Text
        className="font-hk-medium text-[12px]"
        style={{ color: ok ? MET : UNMET }}
      >
        {label}
      </Text>
    </View>
  );
}

export function PasswordHints({ password }: { password: string }) {
  const t = useT();
  if (!password) return null; // stay out of the way until they start typing
  const c = passwordChecks(password);
  return (
    <View style={{ marginTop: 8, marginBottom: 2 }}>
      <Rule ok={c.length} label={t("At least 8 characters", "Mindestens 8 Zeichen")} />
      <Rule ok={c.upper} label={t("One uppercase letter", "Ein Großbuchstabe")} />
      <Rule ok={c.lower} label={t("One lowercase letter", "Ein Kleinbuchstabe")} />
      <Rule ok={c.digit} label={t("One number", "Eine Ziffer")} />
    </View>
  );
}
