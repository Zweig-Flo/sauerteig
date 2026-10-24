import assert from "node:assert/strict";
import { test } from "node:test";
import { batchMood, slowdown, type BatchInput } from "../shared/batch.ts";

const D = 86_400_000;
const START = "2026-10-01T10:00:00.000Z";
const at = (days: number) => Date.parse(START) + days * D;
const when = (days: number) => new Date(at(days)).toISOString();
const batch = (extra: Partial<BatchInput> = {}): BatchInput => ({
  kind: "sauerkraut",
  startedAt: START,
  temperature: 20,
  events: [],
  ...extra,
});

test("cooler is slower: 10 °C less doubles the days", () => {
  assert.equal(slowdown(20), 1);
  assert.equal(slowdown(10), 2);
  assert.equal(slowdown(30), 0.5);
});

test("sauerkraut: fresh, bubbling, ready, overripe, done", () => {
  const moods = [0.5, 5, 20, 100].map((days) => batchMood(batch(), at(days)).mood);
  assert.deepEqual(moods, ["fresh", "bubbling", "ready", "overripe"]);
  const state = batchMood(batch(), at(7));
  assert.equal(state.day, 8);
  assert.equal(state.progress, 0.5);
  assert.equal(state.readyAt, when(14));
  assert.equal(state.burpAt, null);
  assert.equal(batchMood(batch({ events: [{ kind: "done", at: when(30) }] }), at(31)).mood, "done");
});

test("temperature stretches the schedule", () => {
  assert.equal(batchMood(batch({ temperature: 10 }), at(20)).mood, "bubbling");
  assert.equal(batchMood(batch({ temperature: 10 }), at(20)).readyAt, when(28));
});

test("kimchi wants a burp every day until it is overripe", () => {
  const kimchi = (events: BatchInput["events"]) => batch({ kind: "kimchi", events });
  assert.equal(batchMood(kimchi([]), at(0.5)).mood, "fresh");
  assert.equal(batchMood(kimchi([]), at(1.1)).mood, "burp");
  assert.equal(batchMood(kimchi([{ kind: "burp", at: when(1.1) }]), at(1.5)).mood, "bubbling");
  assert.equal(batchMood(kimchi([{ kind: "burp", at: when(1.1) }]), at(1.5)).burpAt, when(2.1));
  assert.equal(batchMood(kimchi([]), at(40)).mood, "overripe");
});

test("kombucha: a stage event starts the second fermentation", () => {
  const first = batchMood(batch({ kind: "kombucha" }), at(8));
  assert.equal(first.mood, "ready");
  assert.equal(first.stage.next, "In Flaschen abgefüllt");
  const second = batchMood(batch({ kind: "kombucha", events: [{ kind: "stage", at: when(9) }] }), at(9.5));
  assert.equal(second.stageIndex, 1);
  assert.equal(second.day, 1);
  assert.equal(second.readyAt, when(11));
});

test("sourdough is no batch", () => {
  assert.throws(() => batchMood(batch({ kind: "sourdough" })));
});
