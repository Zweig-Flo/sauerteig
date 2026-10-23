# Sauerteig

Fermente als Tamagotchi: Sauerteig pflegen, Kimchi, Sauerkraut und Kombucha ansetzen, und jedes zeigt, wie es ihm gerade geht. Läuft als Plugin in food: <https://eat.five.beer/plugins/sauerteig> (Profil → Plugins → „+ Plugin hinzufügen“). Wie Plugins funktionieren: `docs/plugins.md` in `Zweig-Flo/food`.

## Roadmap

_Stand 2026-10-23._

**Gebaut**
- Grundgerüst als food-Plugin: Starter anlegen und archivieren, füttern mit Verhältnis und Hydration, Verlauf (2026-10-22)
- Tamagotchi: Stimmung aus Zeit seit der Fütterung, Verhältnis und Temperatur (Ei, satt, wach, Höhepunkt, hungrig, verhungert, schläft), Hunger-Balken, „Wie letztes Mal“ füttern, Kühlschrank-Modus, Höhepunkt antippen, damit die Vorhersage lernt (2026-10-23)
- Fermente statt nur Sauerteig: Art wählen (Sauerteig, Kimchi, Sauerkraut, Kombucha), Chargen mit Stufen, Reife-Balken, entlüften, probieren mit Notiz, fertig; eigenes Glas je Art (2026-10-23)

**Als Nächstes**
- Push-Erinnerungen („wird hungrig“, „Höhepunkt in 30 Min.“) über food als PWA, braucht dort eine Push-Schnittstelle für Plugins
- Weitere Arten: Ginger Bug, Wasserkefir, Milchkefir (Pflegen), Salzgurken, Chilisauce (Chargen)
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
| POST | `/ferments` | `{ kind, name, notes?, startedAt?, temperature? }`, Sauerteig dazu `flour`, `hydration` |
| GET | `/ferments/:id` | Ferment mit Verlauf, Sauerteig mit den letzten 50 Fütterungen |
| PATCH | `/ferments/:id` | Felder wie oben außer `kind`, dazu `archived` und `fridge` (nur Sauerteig, true = ab jetzt im Kühlschrank) |
| POST | `/ferments/:id/feedings` | nur Sauerteig: `{ starterGrams, flourGrams, waterGrams, fedAt?, note?, temperature? }` |
| POST | `/ferments/:id/events` | `{ kind: burp \| taste \| stage \| done, at?, note? }`, außer `taste` nur bei Chargen |
| DELETE | `/events/:id` | |
| PATCH | `/feedings/:id` | Beobachtung: `{ peakAt?, risePercent?, temperature? }` |
| DELETE | `/feedings/:id` | |

Jedes Ferment hat `family`: `keep` (wird gefüttert) oder `batch` (Charge). Dazu den Zustand zum Zeitpunkt der Anfrage in `keep` bzw. `batch`; die Web-App rechnet ihn minütlich live nach.

- Arten und ihre Regeln: `shared/kinds.ts`. Eine neue Art ist ein Eintrag dort plus ihr Aussehen in `web/src/pet.tsx`.
- Sauerteig (`shared/mood.ts`): Höhepunkt nach etwa 5 Std. bei 1:1:1 und 24 °C, je Verdopplung des Futters 2,5 Std. mehr, je 8 °C kälter doppelt so lang, korrigiert um den Median der beobachteten Höhepunkte. Hungrig ab 1,5 × der Zeit bis zum Höhepunkt, verhungert ab 3 ×. Im Kühlschrank: hungrig nach 7, verhungert nach 14 Tagen.
- Chargen (`shared/batch.ts`): Tage je Stufe bei 20 °C, je 10 °C kälter doppelt so lang. `stage` startet die nächste Stufe (Kombucha: 2. Gärung), `burp` setzt die Entlüftungs-Uhr zurück, `done` beendet die Charge.

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
