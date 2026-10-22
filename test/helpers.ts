import { createApp } from "../server/app.ts";
import { openDatabase } from "../server/db.ts";

export const SECRET = "plugin-geheim";

/** A fresh app on an in-memory database; requests carry food's secret unless `secret: null`. */
export function setup() {
  const db = openDatabase(":memory:");
  const app = createApp({ db, secret: SECRET });

  async function call<T = any>(
    method: string,
    path: string,
    body?: unknown,
    { secret = SECRET as string | null, headers = {} }: { secret?: string | null; headers?: Record<string, string> } = {},
  ): Promise<{ status: number; body: T }> {
    const res = await app.request(`/api${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(secret === null ? {} : { "x-plugin-secret": secret }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: (text ? JSON.parse(text) : null) as T };
  }

  return { db, app, call };
}
