import assert from "node:assert/strict";
import { test } from "node:test";
import { setup } from "./helpers.ts";

const STARTER = { kind: "sourdough", name: "Herbert", flour: "Roggen 1150", hydration: 100 };

test("only food gets in: missing or wrong secret is 403, never 401", async () => {
  const { app, call } = setup();
  assert.equal((await call("GET", "/ferments", undefined, { secret: null })).status, 403);
  assert.equal((await call("GET", "/ferments", undefined, { secret: "falsch" })).status, 403);
  assert.equal((await call("GET", "/ferments")).status, 200);
  // The health check stays open for Coolify.
  assert.equal((await app.request("/health")).status, 200);
});

test("actor comes from food", async () => {
  const { call } = setup();
  assert.equal((await call("GET", "/me")).body.actor, "app");
  assert.equal((await call("GET", "/me", undefined, { headers: { "x-plugin-actor": "claude" } })).body.actor, "claude");
});

test("ferments: created, renamed, archived", async () => {
  const { call } = setup();
  const created = await call("POST", "/ferments", STARTER);
  assert.equal(created.status, 201);
  assert.equal(created.body.lastFeeding, null);
  assert.equal((await call("POST", "/ferments", { ...STARTER, name: "herbert" })).status, 409);
  assert.equal((await call("POST", "/ferments", { ...STARTER, hydration: 20 })).status, 422);

  const id = created.body.id;
  const patched = await call("PATCH", `/ferments/${id}`, { name: "Herbert II", archived: true });
  assert.equal(patched.body.name, "Herbert II");
  assert.equal(patched.body.archived, true);
  assert.equal((await call("PATCH", "/ferments/999", { name: "X" })).status, 404);
});

test("feedings: ratio, newest first, last feeding on the starter", async () => {
  const { call } = setup();
  const { id } = (await call("POST", "/ferments", STARTER)).body;
  const first = await call("POST", `/ferments/${id}/feedings`, {
    fedAt: "2026-10-20T08:00:00+02:00",
    starterGrams: 20,
    flourGrams: 100,
    waterGrams: 100,
  });
  assert.equal(first.status, 201);
  assert.equal(first.body.ratio, "1:5:5");
  assert.equal(first.body.fedAt, "2026-10-20T06:00:00.000Z");
  await call("POST", `/ferments/${id}/feedings`, {
    fedAt: "2026-10-21T08:00:00+02:00",
    starterGrams: 50,
    flourGrams: 50,
    waterGrams: 50,
    note: "kühl gestellt",
  });
  assert.equal((await call("POST", `/ferments/${id}/feedings`, { starterGrams: 10, flourGrams: 0, waterGrams: 10 })).status, 422);

  const starter = (await call("GET", `/ferments/${id}`)).body;
  assert.deepEqual(starter.feedings.map((f: any) => f.ratio), ["1:1:1", "1:5:5"]);
  assert.equal(starter.lastFeeding.note, "kühl gestellt");

  assert.equal((await call("DELETE", `/feedings/${starter.feedings[0].id}`)).status, 200);
  assert.equal((await call("DELETE", `/feedings/${starter.feedings[0].id}`)).status, 404);
  assert.equal((await call("GET", "/ferments")).body[0].lastFeeding.ratio, "1:5:5");
});

test("tamagotchi: mood, observation, fridge", async () => {
  const { call } = setup();
  const { id } = (await call("POST", "/ferments", STARTER)).body;
  assert.equal((await call("GET", `/ferments/${id}`)).body.keep.mood, "egg");

  const fed = await call("POST", `/ferments/${id}/feedings`, { starterGrams: 50, flourGrams: 50, waterGrams: 50, temperature: 24 });
  assert.equal(fed.body.temperature, 24);
  const starter = (await call("GET", `/ferments/${id}`)).body;
  assert.equal(starter.keep.mood, "full");
  assert.ok(starter.keep.peakAt);

  const before = new Date(Date.parse(fed.body.fedAt) - 60_000).toISOString();
  assert.equal((await call("PATCH", `/feedings/${fed.body.id}`, { peakAt: before })).status, 422);
  const peakAt = new Date(Date.parse(fed.body.fedAt) + 4 * 3_600_000).toISOString();
  const observed = await call("PATCH", `/feedings/${fed.body.id}`, { peakAt, risePercent: 150 });
  assert.equal(observed.body.peakHours, 4);
  assert.equal(observed.body.risePercent, 150);
  assert.equal((await call("GET", `/ferments/${id}`)).body.calibration, 0.8);
  assert.equal((await call("PATCH", "/feedings/999", { risePercent: 1 })).status, 404);

  const cold = await call("PATCH", `/ferments/${id}`, { fridge: true });
  assert.equal(cold.body.keep.mood, "sleeping");
  const again = await call("PATCH", `/ferments/${id}`, { fridge: true });
  assert.equal(again.body.fridgeSince, cold.body.fridgeSince);
  assert.equal((await call("PATCH", `/ferments/${id}`, { fridge: false })).body.fridgeSince, null);
});

test("sourdough needs flour and hydration, batches don't", async () => {
  const { call } = setup();
  const missing = await call("POST", "/ferments", { kind: "sourdough", name: "Ohne Mehl" });
  assert.equal(missing.status, 422);
  assert.deepEqual(missing.body.issues.map((i: any) => i.path).sort(), ["flour", "hydration"]);
  assert.equal((await call("POST", "/ferments", { kind: "miso", name: "X" })).status, 422);
  const kimchi = await call("POST", "/ferments", { kind: "kimchi", name: "Kimchi", flour: "egal" });
  assert.equal(kimchi.status, 201);
  assert.equal(kimchi.body.family, "batch");
  assert.equal(kimchi.body.flour, null);
  assert.equal(kimchi.body.batch.mood, "fresh");
});

test("batches: burp, stage, done; no feedings, no fridge", async () => {
  const { call } = setup();
  const days = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  const { id } = (await call("POST", "/ferments", { kind: "kombucha", name: "Tee", startedAt: days(8), temperature: 22 })).body;
  let tea = (await call("GET", `/ferments/${id}`)).body;
  assert.equal(tea.batch.mood, "ready");
  assert.equal(tea.batch.stage.label, "1. Gärung");
  assert.equal((await call("POST", `/ferments/${id}/feedings`, { starterGrams: 1, flourGrams: 1, waterGrams: 1 })).status, 422);
  assert.equal((await call("PATCH", `/ferments/${id}`, { fridge: true })).status, 422);
  assert.equal((await call("POST", `/ferments/${id}/events`, { kind: "burp" })).status, 422);

  assert.equal((await call("POST", `/ferments/${id}/events`, { kind: "stage", at: days(1.5) })).status, 201);
  tea = (await call("GET", `/ferments/${id}`)).body;
  assert.equal(tea.batch.stage.label, "2. Gärung");
  assert.equal(tea.batch.mood, "burp");
  assert.equal((await call("POST", `/ferments/${id}/events`, { kind: "stage" })).status, 422);
  await call("POST", `/ferments/${id}/events`, { kind: "burp" });
  await call("POST", `/ferments/${id}/events`, { kind: "taste", note: "spritzig" });
  tea = (await call("GET", `/ferments/${id}`)).body;
  assert.equal(tea.batch.mood, "bubbling");
  assert.deepEqual(tea.events.map((e: any) => e.kind), ["taste", "burp", "stage"]);

  await call("POST", `/ferments/${id}/events`, { kind: "done" });
  assert.equal((await call("GET", `/ferments/${id}`)).body.batch.mood, "done");
  assert.equal((await call("POST", `/ferments/${id}/events`, { kind: "burp" })).status, 422);
  assert.equal((await call("DELETE", `/events/${tea.events[0].id}`)).status, 200);
  assert.equal((await call("DELETE", `/events/${tea.events[0].id}`)).status, 404);
});
