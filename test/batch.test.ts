import assert from "node:assert/strict";
import { test } from "node:test";
import { batchMood, type BatchInput } from "../shared/batch.ts";
import { slowdown } from "../shared/kinds.ts";

const H = 3_600_000;
const D = 24 * H;
const START = "2026-10-01T10:00:00.000Z";
const at = (days: number) => Date.parse(START) + days * D;
const when = (days: number) => new Date(at(days)).toISOString();
const batch = (extra: Partial<BatchInput> = {}): BatchInput => ({
  kind: "mustard",
  startedAt: START,
  temperature: 21,
  events: [],
  ...extra,
});

test("cooler is slower: 10 °C less doubles the time", () => {
  assert.equal(slowdown(20, 20), 1);
  assert.equal(slowdown(10, 20), 2);
  assert.equal(slowdown(30, 20), 0.5);
});

test("mustard: fresh, bubbling, ready, overripe, done", () => {
  const moods = [0.5, 3, 7, 25].map((days) => batchMood(batch(), at(days)).mood);
  assert.deepEqual(moods, ["fresh", "bubbling", "ready", "overripe"]);
  const state = batchMood(batch(), at(2.5));
  assert.equal(state.day, 3);
  assert.equal(state.progress, 0.5);
  assert.equal(state.readyAt, when(5));
  assert.equal(state.burpAt, null);
  assert.equal(batchMood(batch({ events: [{ kind: "done", at: when(9) }] }), at(10)).mood, "done");
});

test("days are given at the kind's own temperature", () => {
  assert.equal(batchMood(batch({ temperature: 11 }), at(8)).mood, "bubbling");
  assert.equal(batchMood(batch({ temperature: 11 }), at(8)).readyAt, when(10));
  assert.equal(batchMood(batch({ temperature: null }), at(5)).readyAt, when(5));
});

test("sauerkraut wants a look every three days", () => {
  const kraut = (events: BatchInput["events"]) => batch({ kind: "sauerkraut", temperature: 20, events });
  const due = batchMood(kraut([]), at(3.1));
  assert.equal(due.mood, "burp");
  assert.match(due.says, /Lake/);
  const checked = batchMood(kraut([{ kind: "burp", at: when(3.1) }]), at(4));
  assert.equal(checked.mood, "bubbling");
  assert.equal(checked.burpAt, when(6.1));
});

test("kimchi: burp daily, then rests in the fridge whatever the room", () => {
  const kimchi = (events: BatchInput["events"]) => batch({ kind: "kimchi", temperature: 10, events });
  assert.equal(batchMood(kimchi([]), at(0.2)).mood, "fresh");
  assert.equal(batchMood(kimchi([]), at(1.1)).mood, "burp");
  const cold = batchMood(kimchi([{ kind: "stage", at: when(2) }]), at(2.5));
  assert.equal(cold.stageIndex, 1);
  assert.equal(cold.mood, "ready");
  assert.equal(cold.progress, 1);
  assert.equal(cold.says, "Ich bin fertig und ruhe kühl. Bedien dich!");
  assert.equal(batchMood(kimchi([{ kind: "stage", at: when(2) }]), at(93)).mood, "overripe");
});

test("a variant brings its own stages", () => {
  const cucumber = batch({ kind: "kimchi", variant: "oi-sobagi", temperature: 20 });
  assert.equal(batchMood(cucumber, at(0.6)).mood, "ready");
  assert.equal(batchMood({ ...cucumber, variant: null }, at(0.6)).mood, "bubbling");
});

test("kombucha: a stage event starts the second fermentation in bottles", () => {
  const first = batchMood(batch({ kind: "kombucha", temperature: 24 }), at(7.5));
  assert.equal(first.mood, "ready");
  assert.equal(first.stage.next, "In Flaschen abgefüllt");
  const second = batchMood(batch({ kind: "kombucha", temperature: 24, events: [{ kind: "stage", at: when(8) }] }), at(8.5));
  assert.equal(second.stageIndex, 1);
  assert.equal(second.stage.vessel, "bottle");
  assert.equal(second.readyAt, when(11));
});

test("yogurt counts in hours, warmer than the room", () => {
  const yogurt = batch({ kind: "yogurt", temperature: null });
  const half = batchMood(yogurt, Date.parse(START) + 3 * H);
  assert.equal(half.hours, 3);
  assert.equal(half.progress, 0.5);
  assert.equal(batchMood(yogurt, Date.parse(START) + 7 * H).mood, "ready");
  assert.equal(batchMood(yogurt, Date.parse(START) + 15 * H).mood, "overripe");
  assert.equal(batchMood({ ...yogurt, temperature: 34 }, Date.parse(START) + 7 * H).mood, "bubbling");
});

test("what is fed or tended is no batch", () => {
  assert.throws(() => batchMood(batch({ kind: "sourdough" })));
  assert.throws(() => batchMood(batch({ kind: "water-kefir" })));
});
