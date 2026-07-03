// Pure analytics helpers (no RN / Supabase imports) so they stay unit-testable.

type Primitive = string | number | boolean | null;
export type EventProps = Record<string, Primitive>;

export interface AnalyticsEvent {
  type: "track" | "error";
  name: string;
  props?: EventProps;
  userId?: string | null;
  ts: number;
}

/** Keep only primitive props and cap string length so no free-text/PII leaks. */
export function scrubProps(props?: EventProps): EventProps | undefined {
  if (!props) return undefined;
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (typeof v === "string") {
      out[k] = v.length > 64 ? v.slice(0, 64) : v; // clip, never long free-text
    }
  }
  return out;
}

/** Decide whether an event should be emitted given type + consent. */
export function shouldEmit(type: AnalyticsEvent["type"], hasConsent: boolean): boolean {
  if (type === "error") return true; // crash reports always allowed (no PII)
  return hasConsent; // product events need consent
}
