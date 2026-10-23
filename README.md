# Sauerteig

Starter pflegen und Fütterungen festhalten. Läuft als Plugin in food: <https://eat.five.beer/plugins/sauerteig> (Profil → Plugins → „+ Plugin hinzufügen“). Wie Plugins funktionieren: `docs/plugins.md` in `Zweig-Flo/food`.

## Roadmap

_Stand 2026-10-22._

**Gebaut**
- Grundgerüst als food-Plugin: Starter anlegen und archivieren, füttern mit Verhältnis und Hydration, Verlauf (2026-10-22)

**Als Nächstes**
- Erinnerung, wenn ein Starter zu lange nicht gefüttert wurde
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
| PATCH | `/starters/:id` | Felder wie oben, dazu `archived` |
| POST | `/starters/:id/feedings` | `{ starterGrams, flourGrams, waterGrams, fedAt?, note? }` |
| DELETE | `/feedings/:id` | |

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
