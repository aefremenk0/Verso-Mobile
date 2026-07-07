import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import { registerSink, type AnalyticsEvent } from "./analytics";

// Sentry crash reporting as a fetch-based sink — NO native SDK, so it stays
// Expo-Go-safe. It hooks into the existing analytics pipeline: the global JS
// error handler already routes crashes through captureError -> every sink, and
// this sink forwards the ERROR events (not product analytics) to Sentry's HTTP
// ingest endpoint. Inert until you paste a DSN into app.config.js `extra`.
//
// Trade-off vs. the native @sentry/react-native SDK: this captures JS errors we
// route through captureError (redacted, no PII), but NOT native crashes / ANRs /
// automatic breadcrumbs. For full coverage, swap this for the native SDK in a
// dev build later. For an RN-heavy app, JS error capture is most of the value.

const RELEASE = `verso@${Constants.expoConfig?.version ?? "0.0.0"}`;
const ENVIRONMENT = __DEV__ ? "development" : "production";

interface ParsedDsn {
  storeUrl: string;
  publicKey: string;
}

// DSN: https://<publicKey>@<host>/<projectId>
function parseDsn(dsn: string): ParsedDsn | null {
  const m = /^(https?):\/\/([^@]+)@([^/]+)\/(.+)$/.exec(dsn.trim());
  if (!m) return null;
  const [, protocol, publicKey, host, projectId] = m;
  return {
    storeUrl: `${protocol}://${host}/api/${projectId}/store/`,
    publicKey,
  };
}

function eventId(): string {
  // 32 hex chars, no dashes (Sentry event_id format).
  const bytes = Crypto.getRandomBytes(16);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

function makeSink(parsed: ParsedDsn) {
  const authHeader =
    `Sentry sentry_version=7, sentry_client=verso-mobile/${RELEASE}, ` +
    `sentry_key=${parsed.publicKey}`;

  return (e: AnalyticsEvent) => {
    // Only forward crash/error events. Product analytics (track) stay in the
    // first-party Supabase table — never sent to a third party.
    if (e.type !== "error") return;

    // The event already arrives redacted (captureError -> redactText) and
    // consent-checked by emit(). props may carry { fatal: boolean }.
    const fatal = e.props?.fatal === true;
    const payload = {
      event_id: eventId(),
      timestamp: new Date(e.ts).toISOString(),
      platform: "javascript",
      level: fatal ? "fatal" : "error",
      logger: "verso",
      release: RELEASE,
      environment: ENVIRONMENT,
      message: { formatted: e.name },
      tags: e.props ?? {},
      user: e.userId ? { id: e.userId } : undefined,
    };

    // Fire-and-forget; a failed report must never affect the app.
    void (async () => {
      try {
        await fetch(parsed.storeUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "X-Sentry-Auth": authHeader,
          },
          body: JSON.stringify(payload),
        });
      } catch {
        /* swallow — crash reporting must never crash the app */
      }
    })();
  };
}

/** Register the Sentry sink IF a DSN is configured. Call once at startup. */
export function initSentry() {
  const dsn = (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)
    ?.sentryDsn;
  if (!dsn) return; // no DSN -> disabled, no-op
  const parsed = parseDsn(dsn);
  if (!parsed) return; // malformed DSN -> stay silent rather than crash
  registerSink(makeSink(parsed));
}
