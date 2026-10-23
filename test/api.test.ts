import assert from "node:assert/strict";
import { test } from "node:test";
import { setup } from "./helpers.ts";

const STARTER = { name: "Herbert", flour: "Roggen 1150", hydration: 100 };

test("only food gets in: missing or wrong secret is 403, never 401", async () => {
  const { app, call } = setup();
  assert.equal((await call("GET", "/starters", undefined, { secret: null })).status, 403);
  assert.equal((await call("GET", "/starters", undefined, { secret: "falsch" })).status, 403);
  assert.equal((await call("GET", "/starters")).status, 200);
  // The health check stays open for Coolify.
  assert.equal((await app.request("/health")).status, 200);
});

test("actor comes from food", async () => {
  const { call } = setup();
  assert.equal((await call("GET", "/me")).body.actor, "app");
  assert.equal((await call("GET", "/me", undefined, { headers: { "x-plugin-actor": "claude" } })).body.actor, "claude");
});

test("starters: created, renamed, archived", async () => {
  const { call } = setup();
  const created = await call("POST", "/starters", STARTER);
  assert.equal(created.status, 201);
  assert.equal(created.body.lastFeeding, null);
  assert.equal((await call("POST", "/starters", { ...STARTER, name: "herbert" })).status, 409);
  assert.equal((await call("POST", "/starters", { ...STARTER, hydration: 20 })).status, 422);

  const id = created.body.id;
  const patched = await call("PATCH", `/starters/${id}`, { name: "Herbert II", archived: true });
  assert.equal(patched.body.name, "Herbert II");
  assert.equal(patched.body.archived, true);
  assert.equal((await call("PATCH", "/starters/999", { name: "X" })).status, 404);
});

test("feedings: ratio, newest first, last feeding on the starter", async () => {
  const { call } = setup();
  const { id } = (await call("POST", "/starters", STARTER)).body;
  const first = await call("POST", `/starters/${id}/feedings`, {
    fedAt: "2026-10-20T08:00:00+02:00",
    starterGrams: 20,
    flourGrams: 100,
    waterGrams: 100,
  });
  assert.equal(first.status, 201);
  assert.equal(first.body.ratio, "1:5:5");
  assert.equal(first.body.fedAt, "2026-10-20T06:00:00.000Z");
  await call("POST", `/starters/${id}/feedings`, {
    fedAt: "2026-10-21T08:00:00+02:00",
    starterGrams: 50,
    flourGrams: 50,
    waterGrams: 50,
    note: "kühl gestellt",
  });
  assert.equal((await call("POST", `/starters/${id}/feedings`, { starterGrams: 10, flourGrams: 0, waterGrams: 10 })).status, 422);

  const starter = (await call("GET", `/starters/${id}`)).body;
  assert.deepEqual(starter.feedings.map((f: any) => f.ratio), ["1:1:1", "1:5:5"]);
  assert.equal(starter.lastFeeding.note, "kühl gestellt");

  assert.equal((await call("DELETE", `/feedings/${starter.feedings[0].id}`)).status, 200);
  assert.equal((await call("DELETE", `/feedings/${starter.feedings[0].id}`)).status, 404);
  assert.equal((await call("GET", "/starters")).body[0].lastFeeding.ratio, "1:5:5");
});

test("tamagotchi: mood, observation, fridge", async () => {
  const { call } = setup();
  const { id } = (await call("POST", "/starters", STARTER)).body;
  assert.equal((await call("GET", `/starters/${id}`)).body.mood.mood, "egg");

  const fed = await call("POST", `/starters/${id}/feedings`, { starterGrams: 50, flourGrams: 50, waterGrams: 50, temperature: 24 });
  assert.equal(fed.body.temperature, 24);
  const starter = (await call("GET", `/starters/${id}`)).body;
  assert.equal(starter.mood.mood, "full");
  assert.ok(starter.mood.peakAt);

  const before = new Date(Date.parse(fed.body.fedAt) - 60_000).toISOString();
  assert.equal((await call("PATCH", `/feedings/${fed.body.id}`, { peakAt: before })).status, 422);
  const peakAt = new Date(Date.parse(fed.body.fedAt) + 4 * 3_600_000).toISOString();
  const observed = await call("PATCH", `/feedings/${fed.body.id}`, { peakAt, risePercent: 150 });
  assert.equal(observed.body.peakHours, 4);
  assert.equal(observed.body.risePercent, 150);
  assert.equal((await call("GET", `/starters/${id}`)).body.calibration, 0.8);
  assert.equal((await call("PATCH", "/feedings/999", { risePercent: 1 })).status, 404);

  const cold = await call("PATCH", `/starters/${id}`, { fridge: true });
  assert.equal(cold.body.mood.mood, "sleeping");
  const again = await call("PATCH", `/starters/${id}`, { fridge: true });
  assert.equal(again.body.fridgeSince, cold.body.fridgeSince);
  assert.equal((await call("PATCH", `/starters/${id}`, { fridge: false })).body.fridgeSince, null);
});
