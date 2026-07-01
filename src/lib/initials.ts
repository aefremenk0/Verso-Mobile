// Initials from a name, e.g. "Andrey Efremenko" -> "AE" (first letters of up to
// two words). Falls back to "?" for an empty name. RN-free -> testable.
export function initialsFromName(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
