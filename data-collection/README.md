# data-collection

CSV-Vorlagen zum **Sammeln von Orten/Vierteln** (z. B. in Google Sheets,
später Import nach Supabase). Spaltenformat deckungsgleich mit dem `Spot`-Typ
der App.

## `verso_spots_muenchen.csv`
Aktuelles München-Set (10 Orte) + 1 **Beispiel-Event** (`published=FALSE`).

Header: `id,name,category,city,neighborhood,hook,description,tags,ambience,
price_level,rating,address,lat,lng,open_hour,close_hour,reserve_url,image_note,
image_url,tone,date_label,meeting_point,ticket_url,published,notes`

Hinweise:
- **tags / ambience**: mehrere Werte komma-getrennt in EINER Zelle.
- **open_hour / close_hour**: 0–24; nach Mitternacht = +24 (Bar bis 2:00 → 26).
  Leer = die App leitet die Zeit aus der Kategorie ab.
- **Events** (Kategorie `weintasting`/`sport`): `date_label` (= Datum),
  `meeting_point`, `ticket_url` füllen; `open_hour`/`close_hour` bleiben leer.
- **published**: nur `TRUE` erscheint in der App.

Feste Werte:
- category: `restaurant, snack, cafe, bar, club, weintasting, sport`
- ambience: `intim, lebhaft, gemütlich, underground, elegant, draußen`
- tone: `brown, green, charcoal`

## `verso_viertel_muenchen.csv`
Die 8 Münchner Viertel mit Verso-Einzeiler. Header: `city,name,blurb`.
`spots.neighborhood` muss exakt einem `name` hier entsprechen.
