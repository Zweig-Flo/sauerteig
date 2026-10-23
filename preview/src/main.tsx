// Standalone preview without food: the whole app runs in the browser. The Hono API answers fetch() in-page, on SQLite
// as WASM, and the database is kept in localStorage. Same App, same API code, only the router and the storage differ.
import "../../web/src/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { createApp } from "../../server/app.ts";
import { openDatabase, type Db } from "../../server/db.ts";
import { PLUGIN_CONTRACT_VERSION, type PluginContext } from "../../shared/plugin.ts";
import { createApi } from "../../web/src/api.ts";
import { App } from "../../web/src/app.tsx";
import { PluginProvider } from "../../web/src/context.tsx";
import { initSqlite, type DatabaseSync } from "./sqlite.ts";

// Absolute, so it also resolves in a frame without a real base URL; this host never exists, nothing goes out.
const API_BASE = "https://vorschau.invalid/api";
const STORAGE_KEY = "fermente-vorschau";

function load(): Uint8Array | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Uint8Array.from(atob(saved), (c) => c.charCodeAt(0)) : null;
  } catch {
    return null;
  }
}

function save(db: Db) {
  try {
    const bytes = (db as unknown as DatabaseSync).export();
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    localStorage.setItem(STORAGE_KEY, btoa(binary));
  } catch {
    // Private window or blocked storage: the preview still works until the page is closed.
  }
}

let db: Db;
let app: ReturnType<typeof createApp>;

function open(bytes: Uint8Array | null) {
  return initSqlite(bytes).then(() => {
    db = openDatabase(":memory:");
    app = createApp({ db, secret: null });
  });
}

// Requests to the API never leave the page.
const networkFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const request = new Request(input, init);
  if (!request.url.startsWith(API_BASE)) return networkFetch(input, init);
  const url = new URL(request.url);
  const response = await app.request(url.pathname + url.search, request);
  if (request.method !== "GET") save(db);
  return response;
};

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Four example ferments in different moods, so the first view shows what the app does. */
async function seed() {
  const post = (path: string, body: unknown) =>
    app.request(`/api${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const id = async (response: Response | Promise<Response>) => ((await (await response).json()) as { id: number }).id;
  const herbert = await id(post("/ferments", { kind: "sourdough", name: "Herbert (Beispiel)", flour: "Roggen 1150", hydration: 100 }));
  await post(`/ferments/${herbert}/feedings`, { fedAt: hoursAgo(30), starterGrams: 20, flourGrams: 100, waterGrams: 100, temperature: 23 });
  await post(`/ferments/${herbert}/feedings`, { fedAt: hoursAgo(4), starterGrams: 20, flourGrams: 100, waterGrams: 100, temperature: 24 });
  const kimchi = await id(
    post("/ferments", { kind: "kimchi", name: "Kimchi (Beispiel)", startedAt: hoursAgo(52), temperature: 20, notes: "Chinakohl, 2 % Salz, Gochugaru" }),
  );
  await post(`/ferments/${kimchi}/events`, { kind: "burp", at: hoursAgo(26) });
  const kraut = await id(post("/ferments", { kind: "sauerkraut", name: "Weißkraut (Beispiel)", startedAt: hoursAgo(16 * 24), temperature: 19 }));
  await post(`/ferments/${kraut}/events`, { kind: "taste", at: hoursAgo(24), note: "Schon schön sauer, noch knackig" });
  await post("/ferments", { kind: "kombucha", name: "Grüntee-Kombucha (Beispiel)", startedAt: hoursAgo(5 * 24), temperature: 23 });
  save(db);
}

const client = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });

const ctx: PluginContext = {
  contractVersion: PLUGIN_CONTRACT_VERSION,
  key: "sauerteig",
  basePath: "/",
  apiBase: API_BASE,
  navigate: () => {},
  onUnauthorized: () => {},
  theme: "system",
};

function Preview() {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [routerKey, setRouterKey] = useState(0);
  const restart = async (withExamples: boolean) => {
    setBusy(true);
    db.close();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing saved to remove.
    }
    await open(null);
    if (withExamples) await seed();
    else save(db);
    client.clear();
    setRouterKey((key) => key + 1);
    setConfirming(false);
    setBusy(false);
  };
  return (
    <>
      <div className="preview-bar" role="note">
        <p>
          <strong>Vorschau ohne food.</strong> Alles läuft und speichert nur in diesem Browser.
        </p>
        {confirming ? (
          <div className="preview-actions">
            <button type="button" disabled={busy} onClick={() => restart(false)}>
              Ja, alles löschen
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirming(false)}>
              Abbrechen
            </button>
          </div>
        ) : (
          <div className="preview-actions">
            <button type="button" disabled={busy} onClick={() => restart(true)}>
              Beispiele neu laden
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirming(true)}>
              Leer anfangen
            </button>
          </div>
        )}
      </div>
      <PluginProvider value={{ ctx, api: createApi(API_BASE) }}>
        <QueryClientProvider client={client}>
          <MemoryRouter key={routerKey}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      </PluginProvider>
    </>
  );
}

const saved = load();
await open(saved);
if (!saved) await seed();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
