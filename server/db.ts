import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";

export type Db = DatabaseSync;

// Each entry runs once, in order; PRAGMA user_version counts the applied ones.
const MIGRATIONS = [
  `
  CREATE TABLE starters (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL COLLATE NOCASE UNIQUE,
    flour TEXT NOT NULL,
    hydration INTEGER NOT NULL,
    notes TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE feedings (
    id INTEGER PRIMARY KEY,
    starter_id INTEGER NOT NULL REFERENCES starters (id) ON DELETE CASCADE,
    fed_at TEXT NOT NULL,
    starter_grams REAL NOT NULL,
    flour_grams REAL NOT NULL,
    water_grams REAL NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX feedings_starter ON feedings (starter_id, fed_at);
  `,
  `
  ALTER TABLE starters ADD COLUMN fridge_since TEXT;
  ALTER TABLE feedings ADD COLUMN temperature REAL;
  ALTER TABLE feedings ADD COLUMN peak_at TEXT;
  ALTER TABLE feedings ADD COLUMN rise_percent INTEGER;
  `,
];

export function openDatabase(file: string): Db {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  migrate(db);
  return db;
}

function migrate(db: Db) {
  const version = Number(get<{ user_version: number }>(db, "PRAGMA user_version")?.user_version ?? 0);
  for (let next = version; next < MIGRATIONS.length; next++) {
    transaction(db, () => {
      db.exec(MIGRATIONS[next]);
      db.exec(`PRAGMA user_version = ${next + 1}`);
    });
  }
}

const statements = new WeakMap<Db, Map<string, StatementSync>>();

function prepare(db: Db, sql: string): StatementSync {
  let cache = statements.get(db);
  if (!cache) statements.set(db, (cache = new Map()));
  let statement = cache.get(sql);
  if (!statement) cache.set(sql, (statement = db.prepare(sql)));
  return statement;
}

export function all<T>(db: Db, sql: string, ...params: SQLInputValue[]): T[] {
  return prepare(db, sql).all(...params) as T[];
}

export function get<T>(db: Db, sql: string, ...params: SQLInputValue[]): T | undefined {
  return prepare(db, sql).get(...params) as T | undefined;
}

export function run(db: Db, sql: string, ...params: SQLInputValue[]): { changes: number; id: number } {
  const result = prepare(db, sql).run(...params);
  return { changes: Number(result.changes), id: Number(result.lastInsertRowid) };
}

/** Columns and their values; the keys become column names in the SQL. */
type Values = Record<string, SQLInputValue>;

/** Table and column names go into the SQL as they are, so only plain names from code pass. */
function names(table: string, values: Values): string[] {
  const keys = Object.keys(values);
  const invalid = [table, ...keys].find((name) => !/^[a-z_][a-z0-9_]*$/.test(name));
  if (invalid !== undefined) throw new Error(`Kein gültiger Name für Tabelle oder Spalte: ${invalid}`);
  return keys;
}

/** "?, ?, ?" for an IN list. */
export const placeholders = (values: readonly unknown[]) => values.map(() => "?").join(", ");

export function insert(db: Db, table: string, values: Values) {
  const columns = names(table, values);
  return run(db, `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders(columns)})`, ...Object.values(values));
}

/** Sets `values` on the rows that match all of `where`; an empty `where` fails instead of hitting every row. */
export function update(db: Db, table: string, values: Values, where: Values) {
  const set = names(table, values).map((column) => `${column} = ?`);
  const match = names(table, where).map((column) => `${column} = ?`);
  if (!set.length || !match.length) throw new Error(`UPDATE ${table} braucht Werte und eine Bedingung`);
  return run(
    db,
    `UPDATE ${table} SET ${set.join(", ")} WHERE ${match.join(" AND ")}`,
    ...Object.values(values),
    ...Object.values(where),
  );
}

let savepoints = 0;

/** Runs fn atomically. Nested calls use savepoints, so helpers can call each other freely. */
export function transaction<T>(db: Db, fn: () => T): T {
  const name = `sp${++savepoints}`;
  db.exec(`SAVEPOINT ${name}`);
  try {
    const result = fn();
    db.exec(`RELEASE ${name}`);
    return result;
  } catch (error) {
    db.exec(`ROLLBACK TO ${name}`);
    db.exec(`RELEASE ${name}`);
    throw error;
  }
}

export const now = () => new Date().toISOString();
export const bool = (value: unknown) => value === 1 || value === 1n;
export const json = <T>(value: string | null): T => (value ? JSON.parse(value) : []) as T;

/** Error with an HTTP status, turned into a JSON response by the app. */
export class HttpError extends Error {
  status: 400 | 403 | 404 | 409 | 422 | 500;
  constructor(status: HttpError["status"], message: string) {
    super(message);
    this.status = status;
  }
}
