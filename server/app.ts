import { zValidator } from "@hono/zod-validator";
import { Hono, type ValidationTargets } from "hono";
import { z } from "zod";
import { eventInput, feedingInput, feedingObservation, fermentInput, fermentPatch } from "../shared/schema.ts";
import { requirePlugin, type AuthEnv } from "./auth.ts";
import { HttpError, type Db } from "./db.ts";
import {
  addEvent,
  addFeeding,
  createFerment,
  deleteEvent,
  deleteFeeding,
  getFerment,
  listFerments,
  observeFeeding,
  patchFerment,
} from "./ferments.ts";

export interface AppOptions {
  db: Db;
  /** X-Plugin-Secret that food sends; null = no check (local development). */
  secret: string | null;
}

// Validation errors as 422 with readable paths, so Claude can fix its input.
const validate = <Target extends keyof ValidationTargets, T extends z.ZodType>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      return c.json({ error: "Ungültige Eingabe", issues }, 422);
    }
  });

const idParam = z.object({ id: z.coerce.number().int().positive() });

/** Everything below /api; food reaches it as /api/plugins/sauerteig/*. */
export function createApi({ db, secret }: AppOptions) {
  return new Hono<AuthEnv>()
    .use(requirePlugin(secret))
    .get("/me", (c) => c.json({ actor: c.get("actor") }))

    .get("/ferments", (c) => c.json(listFerments(db)))
    .post("/ferments", validate("json", fermentInput), (c) => c.json(createFerment(db, c.req.valid("json")), 201))
    .get("/ferments/:id", validate("param", idParam), (c) => c.json(getFerment(db, c.req.valid("param").id)))
    .patch("/ferments/:id", validate("param", idParam), validate("json", fermentPatch), (c) =>
      c.json(patchFerment(db, c.req.valid("param").id, c.req.valid("json"))),
    )
    .post("/ferments/:id/feedings", validate("param", idParam), validate("json", feedingInput), (c) =>
      c.json(addFeeding(db, c.req.valid("param").id, c.req.valid("json")), 201),
    )
    .post("/ferments/:id/events", validate("param", idParam), validate("json", eventInput), (c) =>
      c.json(addEvent(db, c.req.valid("param").id, c.req.valid("json")), 201),
    )
    .patch("/feedings/:id", validate("param", idParam), validate("json", feedingObservation), (c) =>
      c.json(observeFeeding(db, c.req.valid("param").id, c.req.valid("json"))),
    )
    .delete("/feedings/:id", validate("param", idParam), (c) => {
      deleteFeeding(db, c.req.valid("param").id);
      return c.json({ ok: true });
    })
    .delete("/events/:id", validate("param", idParam), (c) => {
      deleteEvent(db, c.req.valid("param").id);
      return c.json({ ok: true });
    });
}

export type ApiType = ReturnType<typeof createApi>;

export function createApp(options: AppOptions) {
  return new Hono()
    .get("/health", (c) => {
      options.db.prepare("SELECT 1").get();
      return c.text("ok");
    })
    .route("/api", createApi(options))
    .all("/api/*", (c) => c.json({ error: "Nicht gefunden" }, 404))
    .onError((error, c) => {
      if (error instanceof HttpError) return c.json({ error: error.message }, error.status);
      console.error(error);
      return c.json({ error: "Interner Fehler" }, 500);
    });
}
