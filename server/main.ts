import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createApp } from "./app.ts";
import { openDatabase } from "./db.ts";

const production = process.env.NODE_ENV === "production";
const DATA_DIR = process.env.DATA_DIR ?? join(import.meta.dirname, "..", "data");
const WEB_DIST = join(import.meta.dirname, "..", "web", "dist");
// Locally next to food (3000).
const PORT = Number(process.env.PORT ?? 3100);

// Without the secret anyone in the network could reach the data; locally the check is off unless it is set.
const secret = process.env.PLUGIN_SECRET || null;
if (production && !secret) {
  console.error("Umgebungsvariable PLUGIN_SECRET fehlt.");
  process.exit(1);
}

mkdirSync(DATA_DIR, { recursive: true });
const db = openDatabase(join(DATA_DIR, "sauerteig.db"));
const app = createApp({ db, secret });

// The built frontend for food's /plugin-assets/sauerteig/*: manifest.json always fresh, the hashed files forever.
if (existsSync(WEB_DIST)) {
  app.use(
    "/remote/*",
    serveStatic({
      root: WEB_DIST,
      rewriteRequestPath: (path) => path.replace(/^\/remote/, ""),
      onFound: (path, c) => {
        c.header("Cache-Control", path.endsWith("manifest.json") ? "no-cache" : "public, max-age=31536000, immutable");
      },
    }),
  );
} else {
  console.warn("web/dist fehlt, nur die API läuft (npm run build oder npm run dev:web).");
}

const server = serve({ fetch: app.fetch, port: PORT }, ({ port }) => {
  console.log(`Sauerteig läuft auf http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
