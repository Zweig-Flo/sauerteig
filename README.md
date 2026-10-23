# Sauerteig

Starter pflegen und Fütterungen festhalten. Läuft als Plugin in food: <https://eat.five.beer/plugins/sauerteig> (Profil → Plugins → „+ Plugin hinzufügen“). Wie Plugins funktionieren: `docs/plugins.md` in `Zweig-Flo/food`.

## Roadmap

_Stand 2026-10-23._

**Gebaut**
- Grundgerüst als food-Plugin: Starter anlegen und archivieren, füttern mit Verhältnis und Hydration, Verlauf (2026-10-22)
- Tamagotchi: Stimmung aus Zeit seit der Fütterung, Verhältnis und Temperatur (Ei, satt, wach, Höhepunkt, hungrig, verhungert, schläft), Hunger-Balken, „Wie letztes Mal“ füttern, Kühlschrank-Modus, Höhepunkt antippen, damit die Vorhersage lernt (2026-10-23)

**Als Nächstes**
- Push-Erinnerungen („wird hungrig“, „Höhepunkt in 30 Min.“) über food als PWA, braucht dort eine Push-Schnittstelle für Plugins
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
| GET | `/starters` | alle Starter mit letzter Fütterung |
| POST | `/starters` | `{ name, flour, hydration, notes? }` |
| GET | `/starters/:id` | Starter mit den letzten 50 Fütterungen |
| PATCH | `/starters/:id` | Felder wie oben, dazu `archived` und `fridge` (true = ab jetzt im Kühlschrank) |
| POST | `/starters/:id/feedings` | `{ starterGrams, flourGrams, waterGrams, fedAt?, note?, temperature? }` |
| PATCH | `/feedings/:id` | Beobachtung: `{ peakAt?, risePercent?, temperature? }` |
| DELETE | `/feedings/:id` | |

Jeder Starter kommt mit `mood` (`mood`, `says`, `hunger` 0 bis 1, `peakAt`, `hungryAt`) zum Zeitpunkt der Anfrage. Die Regeln stehen in `shared/mood.ts`: Höhepunkt nach etwa 5 Std. bei 1:1:1 und 24 °C, je Verdopplung des Futters 2,5 Std. mehr, je 8 °C kälter doppelt so lang, korrigiert um den Median der beobachteten Höhepunkte. Hungrig ab 1,5 × der Zeit bis zum Höhepunkt, verhungert ab 3 ×. Im Kühlschrank: hungrig nach 7, verhungert nach 14 Tagen.

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

## Deployment

Coolify, zweite App `sauerteig` aus diesem `Dockerfile` (Typecheck und Tests laufen im Build), **ohne öffentliche Domain**, im selben Netz wie food. Persistentes Volume auf `/app/data`.

| Name | Wo | Zweck |
|---|---|---|
| `PLUGIN_SECRET` | sauerteig und food | gleicher Wert; ohne ihn startet sauerteig in Produktion nicht |
| `PLUGIN_SAUERTEIG_URL` | food | interne Adresse, z. B. `http://sauerteig:3000` |
| `BACKUP_S3_*` | sauerteig | wie in food, Schlüssel nur für `sauerteig/` |

Backup: Scheduled Task `backup` mit `node server/backup.ts`, schreibt `sauerteig/YYYY-MM-DD.db.gz` nach Backblaze B2.
