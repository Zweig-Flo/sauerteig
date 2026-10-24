import assert from "node:assert/strict";
import { test } from "node:test";
import { cultureMood, type CultureInput } from "../shared/culture.ts";

const H = 3_600_000;
const D = 24 * H;
const START = "2026-10-01T10:00:00.000Z";
const hours = (n: number) => Date.parse(START) + n * H;
const iso = (n: number) => new Date(hours(n)).toISOString();
const kefir = (extra: Partial<CultureInput> = {}): CultureInput => ({
  kind: "water-kefir",
  startedAt: START,
  temperature: 22,
  fridgeSince: null,
  events: [],
  ...extra,
});

test("water kefir: full, working, ready, hungry, starving", () => {
  const moods = [4, 20, 40, 80, 130].map((n) => cultureMood(kefir(), hours(n)).mood);
  assert.deepEqual(moods, ["full", "rising", "ready", "hungry", "starving"]);
  assert.equal(cultureMood(kefir(), hours(40)).todo, "Abseihen und neu ansetzen");
  assert.equal(cultureMood(kefir(), hours(130)).todo, "Dringend: Abseihen und neu ansetzen");
  assert.equal(cultureMood(kefir(), hours(20)).todo, null);
  assert.equal(cultureMood(kefir(), hours(20)).readyAt, iso(36));
});

test("tending starts the rhythm again", () => {
  const tended = kefir({ events: [{ kind: "feed", at: iso(70) }, { kind: "taste", at: iso(75) }] });
  const state = cultureMood(tended, hours(76));
  assert.equal(state.mood, "full");
  assert.equal(state.tendedAt, iso(70));
});

test("cooler is slower", () => {
  assert.equal(cultureMood(kefir({ temperature: 12 }), hours(40)).mood, "rising");
  assert.equal(cultureMood(kefir({ temperature: 12 }), hours(40)).readyAt, iso(72));
});

test("ginger bug says what it wants when ready", () => {
  const bug = cultureMood(kefir({ kind: "ginger-bug" }), hours(22));
  assert.equal(bug.mood, "ready");
  assert.equal(bug.todo, "Füttern oder Limo ansetzen");
});

test("fridge: sleeps, then wants fresh food; the time before counts", () => {
  const cold = kefir({ fridgeSince: iso(10) });
  assert.equal(cultureMood(cold, hours(10) + 3 * D).mood, "sleeping");
  assert.equal(cultureMood(cold, hours(10) + 8 * D).mood, "hungry");
  assert.equal(cultureMood(cold, hours(10) + 15 * D).mood, "starving");
  assert.equal(cultureMood(cold, hours(10) + 3 * D).readyAt, null);
});
