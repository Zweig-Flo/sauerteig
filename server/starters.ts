import { calibration, mood } from "../shared/mood.ts";
import type { FeedingInput, FeedingObservation, StarterInput, StarterPatch } from "../shared/schema.ts";
import { all, bool, get, HttpError, insert, now, run, transaction, update, type Db } from "./db.ts";

interface StarterRow {
  id: number;
  name: string;
  flour: string;
  hydration: number;
  notes: string | null;
  archived: number;
  fridge_since: string | null;
  created_at: string;
  updated_at: string;
}

interface FeedingRow {
  id: number;
  starter_id: number;
  fed_at: string;
  starter_grams: number;
  flour_grams: number;
  water_grams: number;
  note: string | null;
  temperature: number | null;
  peak_at: string | null;
  rise_percent: number | null;
}

const toFeeding = (row: FeedingRow) => ({
  id: row.id,
  starterId: row.starter_id,
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

function ratio({ starter_grams, flour_grams, water_grams }: FeedingRow): string {
  if (starter_grams <= 0) return `0:${flour_grams}:${water_grams}`;
  const part = (grams: number) => Math.round((grams / starter_grams) * 10) / 10;
  return `1:${part(flour_grams)}:${part(water_grams)}`;
}

function toStarter(row: StarterRow, recent: FeedingRow[]) {
  const feedings = recent.map(toFeeding);
  const last = feedings[0] ?? null;
  const state = { lastFeeding: last, fridgeSince: row.fridge_since, calibration: calibration(feedings) };
  return {
    id: row.id,
    name: row.name,
    flour: row.flour,
    hydration: row.hydration,
    notes: row.notes,
    archived: bool(row.archived),
    bornAt: row.created_at,
    ...state,
    /** At the time of the request; the web app recomputes it live from the fields above. */
    mood: mood(state),
  };
}

export type Starter = ReturnType<typeof toStarter>;

/** Enough feedings for the last one and the calibration. */
const recentFeedings = (db: Db, starterId: number) =>
  all<FeedingRow>(db, "SELECT * FROM feedings WHERE starter_id = ? ORDER BY fed_at DESC, id DESC LIMIT 10", starterId);

function starterRow(db: Db, id: number): StarterRow {
  const row = get<StarterRow>(db, "SELECT * FROM starters WHERE id = ?", id);
  if (!row) throw new HttpError(404, "Starter nicht gefunden");
  return row;
}

/** Active starters first, the most recently fed on top. */
export function listStarters(db: Db) {
  return all<StarterRow>(db, "SELECT * FROM starters ORDER BY archived, name")
    .map((row) => toStarter(row, recentFeedings(db, row.id)))
    .sort((a, b) => Number(a.archived) - Number(b.archived) || (b.lastFeeding?.fedAt ?? "").localeCompare(a.lastFeeding?.fedAt ?? ""));
}

export function getStarter(db: Db, id: number) {
  return { ...toStarter(starterRow(db, id), recentFeedings(db, id)), feedings: listFeedings(db, id) };
}

function nameTaken(db: Db, name: string, except = 0) {
  const other = get<{ id: number }>(db, "SELECT id FROM starters WHERE name = ? AND id != ?", name, except);
  if (other) throw new HttpError(409, `Es gibt schon einen Starter „${name}“`);
}

export function createStarter(db: Db, input: StarterInput) {
  nameTaken(db, input.name);
  const stamp = now();
  const { id } = insert(db, "starters", {
    name: input.name,
    flour: input.flour,
    hydration: input.hydration,
    notes: input.notes ?? null,
    created_at: stamp,
    updated_at: stamp,
  });
  return getStarter(db, id);
}

export function patchStarter(db: Db, id: number, patch: StarterPatch) {
  return transaction(db, () => {
    const row = starterRow(db, id);
    if (patch.name !== undefined) nameTaken(db, patch.name, id);
    const values: Record<string, string | number | null> = { updated_at: now() };
    if (patch.name !== undefined) values.name = patch.name;
    if (patch.flour !== undefined) values.flour = patch.flour;
    if (patch.hydration !== undefined) values.hydration = patch.hydration;
    if (patch.notes !== undefined) values.notes = patch.notes;
    if (patch.archived !== undefined) values.archived = patch.archived ? 1 : 0;
    // Putting it in twice keeps the first time.
    if (patch.fridge !== undefined) values.fridge_since = patch.fridge ? (row.fridge_since ?? now()) : null;
    update(db, "starters", values, { id });
    return getStarter(db, id);
  });
}

/** Newest first, at most `limit`. */
export function listFeedings(db: Db, starterId: number, limit = 50) {
  return all<FeedingRow>(
    db,
    "SELECT * FROM feedings WHERE starter_id = ? ORDER BY fed_at DESC, id DESC LIMIT ?",
    starterId,
    limit,
  ).map(toFeeding);
}

export function addFeeding(db: Db, starterId: number, input: FeedingInput) {
  starterRow(db, starterId);
  const { id } = insert(db, "feedings", {
    starter_id: starterId,
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
