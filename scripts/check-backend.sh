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
# Zähle Elemente eines JSON-Arrays (oder gib -1 bei Nicht-Array/Fehler)
jlen() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);console.log(Array.isArray(j)?j.length:-1)}catch{console.log(-1)}})"; }
jget() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s)$1||'')}catch{console.log('')}})"; }

echo "== Zyklus 1: Katalog-Tabellen lesbar? =="
for T in spots neighborhoods geheimtipp_by_city; do
  # "city" existiert in allen drei Tabellen (neighborhoods/geheimtipp haben kein id)
  RESP=$(curl -sS -w $'\n%{http_code}' "${H_KEY[@]}" "$URL/rest/v1/$T?select=city")
  CODE=$(echo "$RESP" | tail -n1)
  BODY=$(echo "$RESP" | sed '$d')
  N=$(printf '%s' "$BODY" | jlen)
  if [ "$CODE" = "200" ] && [ "$N" -ge 0 ] 2>/dev/null; then
    pass "$T: HTTP 200, $N Zeilen"
  else
    fail "$T: HTTP $CODE — $(printf '%s' "$BODY" | head -c 160)"
  fi
done

echo "== Zyklus 2: Auth — Demo anlegen (falls nötig) + einloggen =="
curl -sS -o /dev/null "${H_KEY[@]}" -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PW\"}" "$URL/auth/v1/signup" || true
LOGIN=$(curl -sS "${H_KEY[@]}" -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PW\"}" \
  "$URL/auth/v1/token?grant_type=password")
TOKEN=$(printf '%s' "$LOGIN" | jget ".access_token")
USERID=$(printf '%s' "$LOGIN" | jget ".user?.id")
if [ -n "$TOKEN" ]; then
  pass "Login ok (User $USERID)"
else
  fail "Login fehlgeschlagen: $(printf '%s' "$LOGIN" | head -c 200)"
  echo "     Tipp: Supabase -> Authentication -> Providers -> Email -> 'Confirm email' AUS,"
  echo "     danach den User demo@verso.app unter Authentication -> Users loeschen (wird neu + bestaetigt angelegt)."
  exit 1
fi

AUTH=(-H "apikey: $KEY" -H "Authorization: Bearer $TOKEN")

echo "== Zyklus 3: profiles-Zeile automatisch angelegt (Trigger 0002)? =="
ROW=$(curl -sS "${AUTH[@]}" "$URL/rest/v1/profiles?select=id,saved_spot_ids,interests,geheimtipp_abgeholt")
if printf '%s' "$ROW" | grep -q "$USERID"; then
  pass "profiles-Zeile existiert + alle Spalten lesbar"
else
  fail "keine profiles-Zeile / Spalte fehlt: $(printf '%s' "$ROW" | head -c 200)"
  echo "     Tipp: 0002_profiles_trigger.sql und 0003_profiles_geheimtipp.sql ausfuehren."
fi

echo "== Zyklus 4: Persistenz-Roundtrip (saved_spot_ids schreiben + zuruecklesen) =="
curl -sS -o /dev/null "${AUTH[@]}" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -X PATCH "$URL/rest/v1/profiles?id=eq.$USERID" -d '{"saved_spot_ids":["m-01","m-02"]}'
BACK=$(curl -sS "${AUTH[@]}" "$URL/rest/v1/profiles?id=eq.$USERID&select=saved_spot_ids")
if printf '%s' "$BACK" | grep -q "m-01"; then pass "geschrieben + zurueckgelesen: $BACK"; else fail "Roundtrip fehlgeschlagen: $BACK"; fi
curl -sS -o /dev/null "${AUTH[@]}" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -X PATCH "$URL/rest/v1/profiles?id=eq.$USERID" -d '{"saved_spot_ids":[]}'

echo "== Zyklus 5: RLS — anonym duerfen KEINE fremden Profile sichtbar sein =="
ANON=$(curl -sS "${H_KEY[@]}" "$URL/rest/v1/profiles?select=id")
if [ "$(printf '%s' "$ANON" | tr -d '[:space:]')" = "[]" ]; then pass "anon sieht 0 Profile (RLS aktiv)"; else fail "RLS-Leck? anon-Antwort: $(printf '%s' "$ANON" | head -c 200)"; fi

echo
echo "Fertig. Alle ✅ = Backend voll verbunden (Katalog, Auth, Trigger, Persistenz, RLS)."
