# Sauerteig

Fermente als Tamagotchi: 37 Fermente mit 25 Sorten, von Sauerteig und Kimchi über Wasserkefir, Miso und Tempeh bis Met. Jedes hat Rezept, Pflege und Quelle, ein eigenes Tamagotchi und zeigt, wie es ihm gerade geht. Läuft als Plugin in food: <https://eat.five.beer/plugins/sauerteig> (Profil → Plugins → „+ Plugin hinzufügen“). Wie Plugins funktionieren: `docs/plugins.md` in `Zweig-Flo/food`.

## Roadmap

_Stand 2026-10-24._

**Gebaut**
- Grundgerüst als food-Plugin: Starter anlegen und archivieren, füttern mit Verhältnis und Hydration, Verlauf (2026-10-22)
- Tamagotchi: Stimmung aus Zeit seit der Fütterung, Verhältnis und Temperatur (Ei, satt, wach, Höhepunkt, hungrig, verhungert, schläft), Hunger-Balken, „Wie letztes Mal“ füttern, Kühlschrank-Modus, Höhepunkt antippen, damit die Vorhersage lernt (2026-10-23)
- Fermente statt nur Sauerteig: Art wählen (Sauerteig, Kimchi, Sauerkraut, Kombucha), Chargen mit Stufen, Reife-Balken, entlüften, probieren mit Notiz, fertig; eigenes Glas je Art (2026-10-23)
- Design wie in food: „Jetzt dran“-Karte, Zeilen statt Karten, Stimmung als Farbfläche, Etikett im Stil der Nährwerttabelle (2026-10-23)
- Deployment in Coolify: `sauerteig` nur intern, statische Vorschau unter <https://fermente.five.beer> (2026-10-24)
- Katalog: 37 Fermente in 7 Gruppen, 25 wählbare Sorten (z. B. Kkakdugi, Jun, Lievito Madre, Labneh), je Rezept, Pflege und geprüfte Quelle; Auswahl mit Suche (2026-10-24)
- Kulturen (Wasserkefir, Milchkefir, Ginger Bug, Nuka-Beet, Viili): leben weiter und wollen im Takt versorgt werden, mit Kühlschrank (2026-10-24)
- Chargen: Handgriff je Stufe (entlüften, umrühren, wenden, nachsehen), Kühlschrank-Stufen, Zeiten bei der eigenen Temperatur der Art, kurze Stufen in Stunden (2026-10-24)
- Eigenes Tamagotchi je Art aus Gefäß (Glas, Bügelflasche, Gärballon, Becher, Schüssel, Brett, Block, Fass), Farbe und Motiv; Sorten färben mit (2026-10-24)

**Als Nächstes**
- Push-Erinnerungen („wird hungrig“, „Höhepunkt in 30 Min.“) über food als PWA, braucht dort eine Push-Schnittstelle für Plugins
- Weitere Sorten, sobald es eine prüfbare Quelle gibt (z. B. Shoyu-Koji, Shiro-Miso). Honigknoblauch erst mit belastbarer Quelle zur Botulismus-Sicherheit
- Alter, Fütterungs-Serie und Abzeichen
- Rezepte und Backplan (Vorteig, Stockgare, Stückgare mit Zeiten)
- Offline: Query-Cache mit eigenem localStorage-Key `sauerteig`

## Aufbau

```
Browser ──► food (eat.five.beer) ──► sauerteig (nur im Coolify-Netz)
            prüft den Login           /api/*     Hono + SQLite, prüft X-Plugin-Secret
                                      /remote/*  manifest.json + gehashter Build
```

- `server/`: Hono-API unter `/api`, `/remote/*` liefert `web/dist` (`manifest.json` mit `no-cache`, alles andere `immutable`), `/health` für Coolify.
- `web/src/remote.tsx`: `mount(el, ctx)` und `contractVersion`, das lädt food. `npm run build` schreibt `web/dist/manifest.json`.
- `web/index.html` und `web/src/dev.tsx`: Entwicklungs-Shell, mountet das Plugin wie food.

## API

Alle Pfade unter `/api`, aus food erreichbar als `/api/plugins/sauerteig/*` (mit Cookie oder Claudes Token).

| Methode | Pfad | |
|---|---|---|
| GET | `/me` | wer fragt (`app` oder `claude`) |
| GET | `/ferments` | alle Fermente mit Zustand |
| POST | `/ferments` | `{ kind, variant?, name, notes?, startedAt?, temperature? }`, Sauerteig dazu `flour`, `hydration` |
| GET | `/ferments/:id` | Ferment mit Verlauf, Sauerteig mit den letzten 50 Fütterungen |
| PATCH | `/ferments/:id` | Felder wie oben außer `kind`, dazu `archived` und `fridge` (Sauerteig und Kulturen, true = ab jetzt im Kühlschrank) |
| POST | `/ferments/:id/feedings` | nur Sauerteig: `{ starterGrams, flourGrams, waterGrams, fedAt?, note?, temperature? }` |
| POST | `/ferments/:id/events` | `{ kind: burp \| taste \| stage \| done \| feed, at?, note? }`: `taste` überall, `feed` nur bei Kulturen, der Rest nur bei Chargen |
| DELETE | `/events/:id` | |
| PATCH | `/feedings/:id` | Beobachtung: `{ peakAt?, risePercent?, temperature? }` |
| DELETE | `/feedings/:id` | |

Jedes Ferment hat `family`: `keep` (Sauerteig, wird mit Mehl gefüttert), `culture` (lebt weiter, wird im Takt versorgt) oder `batch` (Charge). Dazu den Zustand zum Zeitpunkt der Anfrage in `keep`, `culture` bzw. `batch`; die Web-App rechnet ihn minütlich live nach. `variant` ist die Sorte (`null` = Grundrezept).

- Arten: `shared/catalog/<gruppe>.ts`, Typen und Hilfen in `shared/kinds.ts`. Eine neue Art oder Sorte ist ein Eintrag dort, mit Regeln, `look` (Gefäß, Farbe, Motiv für `web/src/pet.tsx`), Rezept, Pflege und Quelle. Rezepte in eigenen Worten, nur geprüfte Links; `test/catalog.test.ts` prüft Vollständigkeit und Plausibilität.
- Sauerteig (`shared/mood.ts`): Höhepunkt nach etwa 5 Std. bei 1:1:1 und 24 °C, je Verdopplung des Futters 2,5 Std. mehr, je 8 °C kälter doppelt so lang, korrigiert um den Median der beobachteten Höhepunkte. Hungrig ab 1,5 × der Zeit bis zum Höhepunkt, verhungert ab 3 ×. Im Kühlschrank: hungrig nach 7, verhungert nach 14 Tagen.
- Chargen (`shared/batch.ts`): Tage je Stufe bei der Standardtemperatur der Art (Joghurt 44 °C, Koji 32 °C, Kimchi 20 °C), je 10 °C kälter doppelt so lang; Stufen mit `fixed` (Kühlschrank, Keller, Sonne) zählen unabhängig vom Raum. `stage` startet die nächste Stufe, `burp` ist der Handgriff der Stufe (`tend`: entlüften, umrühren, wenden, nachsehen) und setzt seine Uhr zurück, `done` beendet die Charge.
- Kulturen (`shared/culture.ts`): bereit, hungrig und verhungert nach Stunden seit dem letzten `feed` (oder dem Ansetzen), bei der Standardtemperatur der Art; im Kühlschrank nach Tagen. Viili verlässt beim Neuansetzen den Kühlschrank.

## Entwickeln

```sh
npm install
npm run dev        # API auf http://localhost:3100, ohne PLUGIN_SECRET ohne Prüfung
npm run dev:web    # http://localhost:5174, leitet /api/plugins/sauerteig an die API weiter
npm test
npm run typecheck
npm run build      # web/dist für food
```

Zusammen mit food: hier `npm run build` und `npm run dev`, in food `PLUGIN_SAUERTEIG_URL=http://localhost:3100 npm run dev`, dann `/plugins/sauerteig`.

## Vorschau ohne food

`npm run build:preview` baut die ganze App als eine statische Seite (`preview/dist/index.html`, als Artifact-Body `preview/dist/fermente.html`). Die Hono-API läuft dabei im Browser und beantwortet `fetch()` direkt in der Seite. SQLite läuft als WASM (sql.js), die Datenbank liegt im `localStorage`. Aliase in `vite.preview.config.ts` tauschen `node:sqlite` und `node:crypto` gegen Browser-Versionen aus `preview/src/`. Beim ersten Öffnen legt die Vorschau Beispiele an. Sie braucht keinen Server und keine Secrets und lässt sich auf jedem statischen Hosting ablegen.

## Deployment

Coolify, zweite App `sauerteig` aus diesem `Dockerfile` (Typecheck und Tests laufen im Build), **ohne öffentliche Domain**, im selben Netz wie food. Persistentes Volume auf `/app/data`.

| Name | Wo | Zweck |
|---|---|---|
| `PLUGIN_SECRET` | sauerteig und food | gleicher Wert; ohne ihn startet sauerteig in Produktion nicht |
| `PLUGIN_SAUERTEIG_URL` | food | interne Adresse `http://<app-uuid>:3000`; dafür ist in Coolify „gleichbleibender Containername“ an |
| `BACKUP_S3_*` | sauerteig | wie in food, Schlüssel nur für `sauerteig/` |

Backup: Scheduled Task `backup` mit `node server/backup.ts`, schreibt `sauerteig/YYYY-MM-DD.db.gz` nach Backblaze B2.

Vorschau: dritte App `fermente` aus diesem Repo, Nixpacks als statische Seite, Install `npm ci`, Build `npm run build:preview`, Publish-Verzeichnis `/preview/dist`, `NIXPACKS_NODE_VERSION=24`, Domain <https://fermente.five.beer>. Kein zweites `npm ci` im Build-Befehl: Nixpacks hängt einen Cache in `node_modules/.cache`, das zweite `npm ci` bricht dann mit `EBUSY` ab.
