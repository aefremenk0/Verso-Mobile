// Supabase Edge Function: send an Expo push to opted-in users.
//
// Fills the gap where `profiles.push_token` was stored but nothing ever sent a
// push. Call this (manually from the dashboard, a cron job, or a DB webhook when
// new content lands) with a segment + title + body; it fans out to every user
// who (a) enabled that notification type in `profiles.notify` and (b) has a
// push token, via Expo's push service.
//
// Deploy:   supabase functions deploy send-push --no-verify-jwt
// Secret:   supabase secrets set PUSH_ADMIN_SECRET=<a-long-random-value>
// Call:     POST { "segment": "spots", "title": "…", "body": "…", "data": {…} }
//           Header: Authorization: <the same secret>
//
// segment ∈ "geheimtipp" | "spots" | "events" (matches the app's toggles).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SEGMENTS = new Set(["geheimtipp", "spots", "events"]);
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Constant-time compare of the admin secret (no early-exit timing leak).
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const ha = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(a)));
  const hb = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(b)));
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Fail CLOSED: no secret configured -> reject everything.
  const secret = Deno.env.get("PUSH_ADMIN_SECRET");
  const auth = req.headers.get("Authorization") ?? "";
  if (!secret || !(await timingSafeEqual(auth, secret))) {
    return new Response("Unauthorized", { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const segment: string = payload?.segment ?? "";
  const title: string = payload?.title ?? "";
  const body: string = payload?.body ?? "";
  const data = payload?.data ?? {};
  if (!SEGMENTS.has(segment) || !title || !body) {
    return new Response("segment (geheimtipp|spots|events) + title + body required", {
      status: 400,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Everyone who enabled this segment AND has a push token (service role bypasses
  // RLS to read tokens; `contains` = the text[] includes the segment).
  const { data: rows, error } = await supabase
    .from("profiles")
    .select("push_token")
    .contains("notify", [segment])
    .not("push_token", "is", null);
  if (error) return new Response(error.message, { status: 500 });

  const tokens = (rows ?? [])
    .map((r: { push_token: string | null }) => r.push_token)
    .filter((t): t is string => Boolean(t) && t.startsWith("ExponentPushToken"));

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  // Expo accepts up to 100 messages per request -> chunk.
  let sent = 0;
  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100).map((to) => ({
      to,
      title,
      body,
      data,
      sound: "default",
    }));
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(chunk),
    });
    if (res.ok) sent += chunk.length;
  }

  return new Response(JSON.stringify({ sent, recipients: tokens.length }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
