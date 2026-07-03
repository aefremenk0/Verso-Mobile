import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasSupabase, supabase } from "./supabase";
import {
  scrubProps,
  shouldEmit,
  type AnalyticsEvent,
  type EventProps,
} from "./analyticsCore";

export { scrubProps, shouldEmit };
export type { AnalyticsEvent, EventProps };

// Lightweight, privacy-first analytics + crash reporting.
//
// Design goals:
//  - NO third-party SDK required (works in Expo Go). The default sink writes to
//    your OWN Supabase table -> GDPR-friendlier, and there's a clean seam to drop
//    in Sentry/PostHog later (registerSink) without touching call sites.
//  - NO PII: we only ever send event names, a hashed/opaque user id (via
//    identify), and whitelisted primitive props. Free-text is never auto-sent.
//  - CONSENT-aware: product events (track) are gated by a persisted opt-out
//    ("anonymous usage stats"), default ON but flippable in Settings. Crash
//    reports (captureError) are kept minimal and always allowed (legitimate
//    interest / debugging) — but also carry no PII.

const CONSENT_KEY = "verso.analytics.consent"; // "on" | "off"

export type Sink = (e: AnalyticsEvent) => void;

let consent = true; // optimistic; corrected from storage on init
let currentUserId: string | null = null;
const sinks: Sink[] = [];

// ── Sinks ────────────────────────────────────────────────────────────────────

export function registerSink(sink: Sink) {
  sinks.push(sink);
}

// Default sink: dev console + fire-and-forget insert into Supabase (if set up).
function defaultSink(e: AnalyticsEvent) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${e.type}:${e.name}`, e.props ?? {});
  }
  if (!hasSupabase) return;
  // Best-effort; never block the UI, never throw. Wrapped in an async IIFE so a
  // rejected insert can't surface as an unhandled promise.
  void (async () => {
    try {
      await supabase.from("analytics_events").insert({
        type: e.type,
        name: e.name,
        props: e.props ?? {},
        user_id: e.userId ?? null,
        ts: new Date(e.ts).toISOString(),
      });
    } catch {
      /* swallow — analytics must never break the app */
    }
  })();
}
registerSink(defaultSink);

function emit(e: AnalyticsEvent) {
  if (!shouldEmit(e.type, consent)) return;
  for (const s of sinks) {
    try {
      s(e);
    } catch {
      /* a broken sink must never crash the app */
    }
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Load persisted consent + install the global JS error handler. Call once. */
export async function initAnalytics() {
  try {
    const v = await AsyncStorage.getItem(CONSENT_KEY);
    if (v === "off") consent = false;
  } catch {
    /* ignore */
  }
  installGlobalErrorHandler();
}

export function isAnalyticsEnabled(): boolean {
  return consent;
}

export async function setAnalyticsConsent(on: boolean) {
  consent = on;
  try {
    await AsyncStorage.setItem(CONSENT_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

/** Associate later events with an opaque user id (a Supabase uuid — not PII on
 *  its own). Pass null to clear on sign-out. */
export function identify(userId: string | null) {
  currentUserId = userId;
}

export function track(name: string, props?: EventProps) {
  emit({ type: "track", name, props: scrubProps(props), userId: currentUserId, ts: Date.now() });
}

export function captureError(error: unknown, context?: EventProps) {
  const name =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  emit({
    type: "error",
    name: name.slice(0, 200),
    props: scrubProps(context),
    userId: currentUserId,
    ts: Date.now(),
  });
}

// ── Global JS error handler ──────────────────────────────────────────────────

let installed = false;
function installGlobalErrorHandler() {
  if (installed) return;
  installed = true;
  // RN exposes ErrorUtils globally; chain our handler before the default one.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = global as any;
  const EU = g.ErrorUtils;
  if (!EU?.getGlobalHandler) return;
  const prev = EU.getGlobalHandler();
  EU.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    captureError(error, { fatal: Boolean(isFatal) });
    if (typeof prev === "function") prev(error, isFatal);
  });
}
