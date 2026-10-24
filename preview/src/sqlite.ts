// node:sqlite for the browser preview, on sql.js (SQLite as WASM). Only what server/db.ts uses.
import initSqlJs, { type Database, type SqlValue } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export type SQLInputValue = SqlValue;

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;
let initial: Uint8Array | null = null;

/** Loads the WASM once; `bytes` is a saved database to open instead of an empty one. */
export async function initSqlite(bytes: Uint8Array | null) {
  SQL ??= await initSqlJs({ locateFile: () => wasmUrl });
  initial = bytes;
}

export class DatabaseSync {
  db: Database;
  constructor(_file: string) {
    if (!SQL) throw new Error("initSqlite() zuerst");
    this.db = new SQL.Database(initial ?? undefined);
  }
  exec(sql: string) {
    this.db.exec(sql);
  }
  // A fresh statement per call: sql.js frees all prepared statements on export().
  prepare(sql: string) {
    const db = this.db;
    const withStatement = <T>(params: SqlValue[], fn: (s: ReturnType<Database["prepare"]>) => T): T => {
      const statement = db.prepare(sql);
      try {
        statement.bind(params);
        return fn(statement);
      } finally {
        statement.free();
      }
    };
    return {
      all: (...params: SqlValue[]) =>
        withStatement(params, (s) => {
          const rows: Record<string, SqlValue>[] = [];
          while (s.step()) rows.push(s.getAsObject());
          return rows;
        }),
      get: (...params: SqlValue[]) => withStatement(params, (s) => (s.step() ? s.getAsObject() : undefined)),
      run: (...params: SqlValue[]) => {
        withStatement(params, (s) => s.step());
        const id = db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] ?? 0;
        return { changes: db.getRowsModified(), lastInsertRowid: Number(id) };
      },
    };
  }
  export() {
    return this.db.export();
  }
  close() {
    this.db.close();
  }
}

export type StatementSync = ReturnType<DatabaseSync["prepare"]>;
