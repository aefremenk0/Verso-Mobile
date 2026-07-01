#!/usr/bin/env bash
# Verso — Backend-Smoke-Test gegen Supabase (REST + Auth).
# Nutzt nur curl + node (beides ist im Projekt vorhanden). Der publishable Key
# ist public by design. Auf dem Mac ausführen:  bash scripts/check-backend.sh
set -u

URL="https://nzdhnfkoegzcjpkkmbmm.supabase.co"
KEY="sb_publishable_zQEIeJRC-xcoRgnGat6oEQ_nV4km4UG"
DEMO_EMAIL="demo@verso.app"
DEMO_PW="versodemo"

H_KEY=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY")
pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; }

echo "== Zyklus 1: Katalog-Tabellen lesbar? =="
for T in spots neighborhoods geheimtipp_by_city; do
  CR=$(curl -sS -o /dev/null -D - "${H_KEY[@]}" -H "Prefer: count=exact" -H "Range: 0-0" \
        "$URL/rest/v1/$T?select=*" | tr -d '\r' | awk -F'/' '/content-range/ {print $2}')
  if [ -n "${CR:-}" ]; then pass "$T: $CR Zeilen"; else fail "$T: keine Antwort (SQL/Seed ausgeführt? RLS-Read-Policy da?)"; fi
done

echo "== Zyklus 2: Auth — Demo anlegen (falls nötig) + einloggen =="
curl -sS -o /dev/null "${H_KEY[@]}" -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PW\"}" "$URL/auth/v1/signup" || true
LOGIN=$(curl -sS "${H_KEY[@]}" -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PW\"}" \
  "$URL/auth/v1/token?grant_type=password")
TOKEN=$(echo "$LOGIN" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).access_token||'')}catch{console.log('')}})")
UID=$(echo "$LOGIN"   | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).user?.id||'')}catch{console.log('')}})")
if [ -n "$TOKEN" ]; then pass "Login ok (User $UID)"; else
  fail "Login fehlgeschlagen: $(echo "$LOGIN" | head -c 200)"
  echo "     Tipp: in Supabase Authentication -> Providers -> Email -> 'Confirm email' AUS."
  exit 1
fi

AUTH=(-H "apikey: $KEY" -H "Authorization: Bearer $TOKEN")

echo "== Zyklus 3: profiles-Zeile automatisch angelegt (Trigger 0002)? =="
ROW=$(curl -sS "${AUTH[@]}" "$URL/rest/v1/profiles?select=id,saved_spot_ids,interests,geheimtipp_abgeholt")
if echo "$ROW" | grep -q "$UID"; then pass "profiles-Zeile existiert + alle Spalten lesbar"; else
  fail "keine profiles-Zeile / Spalte fehlt: $(echo "$ROW" | head -c 200)"
  echo "     Tipp: 0002_profiles_trigger.sql und 0003_profiles_geheimtipp.sql ausführen."
fi

echo "== Zyklus 4: Persistenz-Roundtrip (saved_spot_ids schreiben + zurücklesen) =="
curl -sS -o /dev/null "${AUTH[@]}" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -X PATCH "$URL/rest/v1/profiles?id=eq.$UID" -d '{"saved_spot_ids":["m-01","m-02"]}'
BACK=$(curl -sS "${AUTH[@]}" "$URL/rest/v1/profiles?id=eq.$UID&select=saved_spot_ids")
if echo "$BACK" | grep -q "m-01"; then pass "geschrieben + zurückgelesen: $BACK"; else fail "Roundtrip fehlgeschlagen: $BACK"; fi
# wieder aufräumen
curl -sS -o /dev/null "${AUTH[@]}" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -X PATCH "$URL/rest/v1/profiles?id=eq.$UID" -d '{"saved_spot_ids":[]}'

echo "== Zyklus 5: RLS — anonym dürfen KEINE fremden Profile sichtbar sein =="
ANON=$(curl -sS "${H_KEY[@]}" "$URL/rest/v1/profiles?select=id")
if [ "$(echo "$ANON" | tr -d '[:space:]')" = "[]" ]; then pass "anon sieht 0 Profile (RLS aktiv)"; else fail "RLS-Leck? anon-Antwort: $(echo "$ANON" | head -c 200)"; fi

echo
echo "Fertig. Alle ✅ = Backend läuft (Katalog-Read, Auth, Trigger, Persistenz, RLS)."
