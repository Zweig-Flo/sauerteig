# CLAUDE.md

Fermente für Flo als Tamagotchi: Sauerteig pflegen, Kimchi, Sauerkraut und Kombucha ansetzen. Arten und Regeln in `shared/kinds.ts`. Läuft als Plugin in food (`Zweig-Flo/food`, `docs/plugins.md`) unter <https://eat.five.beer/plugins/sauerteig>. Überblick und Betrieb: [`README.md`](README.md).

## Stack und Befehle

- Gleicher Stack wie food: Hono auf Node.js, TypeScript wird direkt ausgeführt. Nur löschbare Syntax (keine `enum`, keine Parameter-Properties, `import type` für Typen, Importe mit `.ts`).
- Datenbank: `node:sqlite`, Migrationen als Liste in `server/db.ts` (nur anhängen, nie alte ändern, sobald produktive Daten existieren). Schreibzugriffe mit `insert`/`update` aus `server/db.ts`.
- Oberfläche: React + Vite + TanStack Query, aber keine eigene Seite: `web/src/remote.tsx` exportiert `mount(el, ctx)`, food lädt es über `manifest.json`. API-Aufrufe nur über `web/src/api.ts` (typisiert über `ApiType`, Basis ist `ctx.apiBase`).
- Eingaben werden mit den zod-Schemas in `shared/schema.ts` geprüft. Neue Felder dort zuerst.
- `npm test`, `npm run typecheck`, `npm run build`. Tests laufen auf einer In-Memory-Datenbank über `app.request()`.

## Regeln als Plugin

- Kein eigener Login. food prüft die Session und schickt `X-Plugin-Secret` und `X-Plugin-Actor`. Ohne gültiges Secret antwortet die API mit 403, nie mit 401 (401 heißt für food „Session abgelaufen“).
- `shared/plugin.ts` ist eine Kopie aus food und muss mit ihr übereinstimmen.
- CSS-Klassen nur mit Präfix `st-`, Farben und Schrift über die CSS-Variablen von food.
- Router mit `basename = ctx.basePath`, Sprünge nach food nur über `ctx.navigate`. Modals in `el`, nicht in `document.body`.

## Konventionen

- Oberfläche auf Deutsch, Code und Bezeichner auf Englisch.
- Commit-Messages mit Gitmoji, kurz und auf Englisch.
- Änderungen über Branch und Pull Request, nicht direkt auf `main`.
- Die Roadmap im README aktuell halten.
- Zeitpunkte als ISO in UTC speichern, in Europe/Berlin anzeigen.

## Secrets

Werte gehören nie in den Chat, in Ausgaben oder ins Repo. `PLUGIN_SECRET` und die `BACKUP_S3_*`-Werte setzt Flo in Coolify.
