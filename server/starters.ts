import type { FeedingInput, StarterInput, StarterPatch } from "../shared/schema.ts";
import { all, bool, get, HttpError, insert, now, run, transaction, update, type Db } from "./db.ts";

interface StarterRow {
  id: number;
  name: string;
  flour: string;
  hydration: number;
  notes: string | null;
  archived: number;
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
});

export type Feeding = ReturnType<typeof toFeeding>;

function ratio({ starter_grams, flour_grams, water_grams }: FeedingRow): string {
  if (starter_grams <= 0) return `0:${flour_grams}:${water_grams}`;
  const part = (grams: number) => Math.round((grams / starter_grams) * 10) / 10;
  return `1:${part(flour_grams)}:${part(water_grams)}`;
}

function toStarter(row: StarterRow, last: FeedingRow | undefined) {
  return {
    id: row.id,
    name: row.name,
    flour: row.flour,
    hydration: row.hydration,
    notes: row.notes,
    archived: bool(row.archived),
    lastFeeding: last ? toFeeding(last) : null,
  };
}

export type Starter = ReturnType<typeof toStarter>;

const lastFeeding = (db: Db, starterId: number) =>
  get<FeedingRow>(db, "SELECT * FROM feedings WHERE starter_id = ? ORDER BY fed_at DESC, id DESC LIMIT 1", starterId);

function starterRow(db: Db, id: number): StarterRow {
  const row = get<StarterRow>(db, "SELECT * FROM starters WHERE id = ?", id);
  if (!row) throw new HttpError(404, "Starter nicht gefunden");
  return row;
}

/** Active starters first, the most recently fed on top. */
export function listStarters(db: Db) {
  return all<StarterRow>(db, "SELECT * FROM starters ORDER BY archived, name")
    .map((row) => toStarter(row, lastFeeding(db, row.id)))
    .sort((a, b) => Number(a.archived) - Number(b.archived) || (b.lastFeeding?.fedAt ?? "").localeCompare(a.lastFeeding?.fedAt ?? ""));
}

export function getStarter(db: Db, id: number) {
  return { ...toStarter(starterRow(db, id), lastFeeding(db, id)), feedings: listFeedings(db, id) };
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
    starterRow(db, id);
    if (patch.name !== undefined) nameTaken(db, patch.name, id);
    const values: Record<string, string | number | null> = { updated_at: now() };
    if (patch.name !== undefined) values.name = patch.name;
    if (patch.flour !== undefined) values.flour = patch.flour;
    if (patch.hydration !== undefined) values.hydration = patch.hydration;
    if (patch.notes !== undefined) values.notes = patch.notes;
    if (patch.archived !== undefined) values.archived = patch.archived ? 1 : 0;
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
    created_at: now(),
  });
  return toFeeding(get<FeedingRow>(db, "SELECT * FROM feedings WHERE id = ?", id)!);
}

export function deleteFeeding(db: Db, id: number) {
  if (run(db, "DELETE FROM feedings WHERE id = ?", id).changes === 0) throw new HttpError(404, "Fütterung nicht gefunden");
}
