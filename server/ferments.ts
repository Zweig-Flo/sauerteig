import { batchMood, type EventKind } from "../shared/batch.ts";
import { isKind, rules, type Kind } from "../shared/kinds.ts";
import { calibration, mood } from "../shared/mood.ts";
import type { EventInput, FeedingInput, FeedingObservation, FermentInput, FermentPatch } from "../shared/schema.ts";
import { all, bool, get, HttpError, insert, now, run, transaction, update, type Db } from "./db.ts";

interface FermentRow {
  id: number;
  kind: string;
  name: string;
  flour: string | null;
  hydration: number | null;
  notes: string | null;
  temperature: number | null;
  started_at: string;
  fridge_since: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

interface FeedingRow {
  id: number;
  ferment_id: number;
  fed_at: string;
  starter_grams: number;
  flour_grams: number;
  water_grams: number;
  note: string | null;
  temperature: number | null;
  peak_at: string | null;
  rise_percent: number | null;
}

interface EventRow {
  id: number;
  ferment_id: number;
  kind: EventKind;
  at: string;
  note: string | null;
}

const toFeeding = (row: FeedingRow) => ({
  id: row.id,
  fermentId: row.ferment_id,
  fedAt: row.fed_at,
  starterGrams: row.starter_grams,
  flourGrams: row.flour_grams,
  waterGrams: row.water_grams,
  /** Starter : flour : water relative to the starter, e.g. "1:5:5". */
  ratio: ratio(row),
  note: row.note,
  temperature: row.temperature,
  peakAt: row.peak_at,
  risePercent: row.rise_percent,
  /** Hours from feeding to the observed peak. */
  peakHours: row.peak_at ? Math.round((Date.parse(row.peak_at) - Date.parse(row.fed_at)) / 360_000) / 10 : null,
});

export type Feeding = ReturnType<typeof toFeeding>;

const toEvent = (row: EventRow) => ({ id: row.id, fermentId: row.ferment_id, kind: row.kind, at: row.at, note: row.note });

function ratio({ starter_grams, flour_grams, water_grams }: FeedingRow): string {
  if (starter_grams <= 0) return `0:${flour_grams}:${water_grams}`;
  const part = (grams: number) => Math.round((grams / starter_grams) * 10) / 10;
  return `1:${part(flour_grams)}:${part(water_grams)}`;
}

function kindOf(row: FermentRow): Kind {
  if (!isKind(row.kind)) throw new Error(`Unbekannte Art ${row.kind}`);
  return row.kind;
}

/** A ferment with its state: `keep` for one that gets fed, `batch` for one that ripens. Mood at the time of the request. */
function toFerment(db: Db, row: FermentRow) {
  const kind = kindOf(row);
  const base = {
    id: row.id,
    kind,
    name: row.name,
    notes: row.notes,
    temperature: row.temperature,
    startedAt: row.started_at,
    archived: bool(row.archived),
    events: listEvents(db, row.id),
  };
  if (rules(kind).family === "keep") {
    const feedings = recentFeedings(db, row.id).map(toFeeding);
    const state = { lastFeeding: feedings[0] ?? null, fridgeSince: row.fridge_since, calibration: calibration(feedings) };
    return {
      ...base,
      family: "keep" as const,
      flour: row.flour ?? "",
      hydration: row.hydration ?? 100,
      ...state,
      /** The web app recomputes it live from the fields above. */
      keep: mood(state),
      batch: null,
    };
  }
  return {
    ...base,
    family: "batch" as const,
    flour: null,
    hydration: null,
    lastFeeding: null,
    fridgeSince: null,
    calibration: 1,
    keep: null,
    batch: batchMood({ kind, startedAt: row.started_at, temperature: row.temperature, events: base.events }),
  };
}

export type Ferment = ReturnType<typeof toFerment>;

/** Enough feedings for the last one and the calibration. */
const recentFeedings = (db: Db, fermentId: number) =>
  all<FeedingRow>(db, "SELECT * FROM feedings WHERE ferment_id = ? ORDER BY fed_at DESC, id DESC LIMIT 10", fermentId);

const listEvents = (db: Db, fermentId: number) =>
  all<EventRow>(db, "SELECT * FROM events WHERE ferment_id = ? ORDER BY at DESC, id DESC", fermentId).map(toEvent);

function fermentRow(db: Db, id: number): FermentRow {
  const row = get<FermentRow>(db, "SELECT * FROM ferments WHERE id = ?", id);
  if (!row) throw new HttpError(404, "Ferment nicht gefunden");
  return row;
}

/** Active ones first, the most recently touched on top. */
export function listFerments(db: Db) {
  const touched = (f: Ferment) => [f.lastFeeding?.fedAt ?? "", f.events[0]?.at ?? "", f.startedAt].sort().at(-1)!;
  return all<FermentRow>(db, "SELECT * FROM ferments ORDER BY archived, name")
    .map((row) => toFerment(db, row))
    .sort((a, b) => Number(a.archived) - Number(b.archived) || touched(b).localeCompare(touched(a)));
}

export function getFerment(db: Db, id: number) {
  const ferment = toFerment(db, fermentRow(db, id));
  return { ...ferment, feedings: ferment.family === "keep" ? listFeedings(db, id) : [] };
}

function nameTaken(db: Db, name: string, except = 0) {
  const other = get<{ id: number }>(db, "SELECT id FROM ferments WHERE name = ? AND id != ?", name, except);
  if (other) throw new HttpError(409, `Es gibt schon ein Ferment „${name}“`);
}

export function createFerment(db: Db, input: FermentInput) {
  nameTaken(db, input.name);
  const stamp = now();
  const sourdough = input.kind === "sourdough";
  const { id } = insert(db, "ferments", {
    kind: input.kind,
    name: input.name,
    flour: sourdough ? (input.flour ?? null) : null,
    hydration: sourdough ? (input.hydration ?? null) : null,
    notes: input.notes ?? null,
    temperature: input.temperature ?? null,
    started_at: input.startedAt ? new Date(input.startedAt).toISOString() : stamp,
    created_at: stamp,
    updated_at: stamp,
  });
  return getFerment(db, id);
}

export function patchFerment(db: Db, id: number, patch: FermentPatch) {
  return transaction(db, () => {
    const row = fermentRow(db, id);
    if (patch.name != null) nameTaken(db, patch.name, id);
    const keep = rules(kindOf(row)).family === "keep";
    const values: Record<string, string | number | null> = { updated_at: now() };
    if (patch.name != null) values.name = patch.name;
    if (patch.notes !== undefined) values.notes = patch.notes;
    if (patch.temperature !== undefined) values.temperature = patch.temperature;
    if (keep && patch.flour != null) values.flour = patch.flour;
    if (keep && patch.hydration != null) values.hydration = patch.hydration;
    if (patch.archived !== undefined) values.archived = patch.archived ? 1 : 0;
    if (patch.fridge !== undefined) {
      if (!keep) throw new HttpError(422, "Nur was gefüttert wird, kann in den Kühlschrank");
      // Putting it in twice keeps the first time.
      values.fridge_since = patch.fridge ? (row.fridge_since ?? now()) : null;
    }
    update(db, "ferments", values, { id });
    return getFerment(db, id);
  });
}

/** Newest first, at most `limit`. */
export function listFeedings(db: Db, fermentId: number, limit = 50) {
  return all<FeedingRow>(
    db,
    "SELECT * FROM feedings WHERE ferment_id = ? ORDER BY fed_at DESC, id DESC LIMIT ?",
    fermentId,
    limit,
  ).map(toFeeding);
}

export function addFeeding(db: Db, fermentId: number, input: FeedingInput) {
  if (rules(kindOf(fermentRow(db, fermentId))).family !== "keep")
    throw new HttpError(422, "Eine Charge wird nicht gefüttert");
  const { id } = insert(db, "feedings", {
    ferment_id: fermentId,
    fed_at: new Date(input.fedAt ?? Date.now()).toISOString(),
    starter_grams: input.starterGrams,
    flour_grams: input.flourGrams,
    water_grams: input.waterGrams,
    note: input.note ?? null,
    temperature: input.temperature ?? null,
    created_at: now(),
  });
  return toFeeding(feedingRow(db, id));
}

function feedingRow(db: Db, id: number): FeedingRow {
  const row = get<FeedingRow>(db, "SELECT * FROM feedings WHERE id = ?", id);
  if (!row) throw new HttpError(404, "Fütterung nicht gefunden");
  return row;
}

/** Peak, rise and temperature seen after a feeding; they teach the mood when this starter peaks. */
export function observeFeeding(db: Db, id: number, input: FeedingObservation) {
  return transaction(db, () => {
    const row = feedingRow(db, id);
    const values: Record<string, string | number | null> = {};
    if (input.peakAt !== undefined) {
      const peakAt = input.peakAt === null ? null : new Date(input.peakAt).toISOString();
      if (peakAt !== null && peakAt <= row.fed_at) throw new HttpError(422, "Der Höhepunkt kommt nach der Fütterung");
      values.peak_at = peakAt;
    }
    if (input.risePercent !== undefined) values.rise_percent = input.risePercent;
    if (input.temperature !== undefined) values.temperature = input.temperature;
    if (Object.keys(values).length) update(db, "feedings", values, { id });
    return toFeeding(feedingRow(db, id));
  });
}

export function deleteFeeding(db: Db, id: number) {
  if (run(db, "DELETE FROM feedings WHERE id = ?", id).changes === 0) throw new HttpError(404, "Fütterung nicht gefunden");
}

/** Burped, tasted, next stage or done. Only tasting works for what gets fed; a batch has no stage after its last. */
export function addEvent(db: Db, fermentId: number, input: EventInput) {
  return transaction(db, () => {
    const ferment = toFerment(db, fermentRow(db, fermentId));
    if (input.kind !== "taste") {
      if (!ferment.batch) throw new HttpError(422, "Das geht nur bei einer Charge");
      if (ferment.batch.mood === "done") throw new HttpError(422, "Die Charge ist schon fertig");
      if (input.kind === "burp" && !ferment.batch.stage.burpHours) throw new HttpError(422, "Diese Stufe muss nicht entlüftet werden");
      if (input.kind === "stage" && !ferment.batch.stage.next) throw new HttpError(422, "Das ist schon die letzte Stufe");
    }
    const { id } = insert(db, "events", {
      ferment_id: fermentId,
      kind: input.kind,
      at: new Date(input.at ?? Date.now()).toISOString(),
      note: input.note ?? null,
      created_at: now(),
    });
    return toEvent(get<EventRow>(db, "SELECT * FROM events WHERE id = ?", id)!);
  });
}

export function deleteEvent(db: Db, id: number) {
  if (run(db, "DELETE FROM events WHERE id = ?", id).changes === 0) throw new HttpError(404, "Eintrag nicht gefunden");
}
