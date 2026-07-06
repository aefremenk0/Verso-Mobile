// Supabase Edge Function: RevenueCat webhook -> profiles.is_insider.
//
// RevenueCat calls this on every subscription event. We map the event's
// `app_user_id` (which the app sets to the Supabase user id via
// Purchases.logIn(user.id)) to the profile row and write the Insider status
// using the SERVICE ROLE key (bypasses RLS — server-side only, never in the app).
//
// Deploy:   supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secret:   supabase secrets set REVENUECAT_WEBHOOK_SECRET=<your-authorization-value>
// RevenueCat: Integrations -> Webhooks -> URL = the function URL,
//             Authorization header = the same secret value.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ENTITLEMENT = "insider";

// Constant-time string compare (avoids leaking the secret via response timing).
// Hash both sides to equal-length digests, then diff every byte — no early exit.
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const ha = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(a)));
  const hb = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(b)));
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

// Event types that grant / keep access vs. revoke it.
const GRANTING = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
]);
const REVOKING = new Set(["EXPIRATION", "SUBSCRIPTION_PAUSED"]);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify the shared secret (RevenueCat sends it as the Authorization header).
  // Fail CLOSED: if the secret isn't configured, reject everything — otherwise a
  // missing env var would let anyone POST and grant/revoke Insider status.
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
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

  const event = payload?.event;
  const uid: string | undefined = event?.app_user_id;
  if (!event || !uid) {
    return new Response("No event / app_user_id", { status: 200 });
  }

  // Does this event concern the "insider" entitlement?
  const entitlements: string[] =
    event.entitlement_ids ??
    (event.entitlement_id ? [event.entitlement_id] : []);
  // Only act when the "insider" entitlement is explicitly present. An event that
  // omits entitlement fields (or concerns some other product) must NOT flip
  // Insider on — don't treat an empty list as "touches insider".
  const touchesInsider = entitlements.includes(ENTITLEMENT);

  const expiresMs: number | null = event.expiration_at_ms ?? null;
  const activeByTime = expiresMs ? expiresMs > Date.now() : true;

  // Decide the resulting Insider status (null = ignore this event type).
  let isInsider: boolean | null = null;
  if (REVOKING.has(event.type)) isInsider = false;
  else if (GRANTING.has(event.type) && touchesInsider) isInsider = activeByTime;
  else if (event.type === "CANCELLATION") isInsider = activeByTime; // access until expiry
  else if (event.type === "BILLING_ISSUE") isInsider = activeByTime; // grace period

  if (isInsider === null) {
    return new Response("ignored", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await supabase
    .from("profiles")
    .update({
      is_insider: isInsider,
      insider_expires_at: expiresMs ? new Date(expiresMs).toISOString() : null,
    })
    .eq("id", uid);

  if (error) return new Response(error.message, { status: 500 });
  return new Response("ok", { status: 200 });
});
