// food is the only place that checks the login (food: docs/plugins.md). It passes requests on inside the Coolify
// network with X-Plugin-Secret and X-Plugin-Actor; this app trusts nothing else.
import { createHash, timingSafeEqual } from "node:crypto";
import { createMiddleware } from "hono/factory";

export type Actor = "app" | "claude";
export type AuthEnv = { Variables: { actor: Actor } };

const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * Only requests that carry `secret`; null lets everything through (local development only, main.ts refuses it in
 * production). A wrong secret is 403, never 401: food takes a 401 for an expired session and shows its login.
 */
export function requirePlugin(secret: string | null) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    if (secret !== null) {
      const sent = c.req.header("x-plugin-secret") ?? "";
      if (!timingSafeEqual(digest(sent), digest(secret))) return c.json({ error: "Nur über food erreichbar" }, 403);
    }
    c.set("actor", c.req.header("x-plugin-actor") === "claude" ? "claude" : "app");
    return next();
  });
}
