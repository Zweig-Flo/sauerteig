import assert from "node:assert/strict";
import { test } from "node:test";
import { calibration, mood, predictedPeakHours, type MoodFeeding } from "../shared/mood.ts";

const H = 3_600_000;
const FED = "2026-10-20T06:00:00.000Z";
const at = (hours: number) => Date.parse(FED) + hours * H;
const feeding = (extra: Partial<MoodFeeding> = {}): MoodFeeding => ({
  fedAt: FED,
  starterGrams: 20,
  flourGrams: 100,
  temperature: 24,
  peakAt: null,
  ...extra,
});
const room = (extra: Partial<MoodFeeding> = {}) => ({ lastFeeding: feeding(extra), fridgeSince: null, calibration: 1 });

test("peak: bigger feed and cooler room take longer", () => {
  const oneToOne = predictedPeakHours({ starterGrams: 50, flourGrams: 50, temperature: 24 });
  assert.equal(oneToOne, 5);
  assert.ok(predictedPeakHours({ starterGrams: 20, flourGrams: 100, temperature: 24 }) > oneToOne);
  assert.equal(predictedPeakHours({ starterGrams: 50, flourGrams: 50, temperature: 16 }), 10);
});

test("a starter without feedings is an egg", () => {
  assert.equal(mood({ lastFeeding: null, fridgeSince: null, calibration: 1 }).mood, "egg");
});

test("room temperature: full, rising, peak, hungry, starving", () => {
  const peak = predictedPeakHours(feeding()); // about 9 h for 1:5:5 at 24 °C
  const moods = [0.1, 0.5, 1, 2, 3.1].map((share) => mood(room(), at(peak * share)).mood);
  assert.deepEqual(moods, ["full", "rising", "peak", "hungry", "starving"]);
  const rising = mood(room(), at(peak / 2));
  assert.equal(Date.parse(rising.peakAt!), Math.floor(at(peak)));
  assert.ok(rising.hunger > 0 && rising.hunger < 0.5);
});

test("an observed peak replaces the prediction", () => {
  const state = mood(room({ peakAt: "2026-10-20T08:00:00.000Z" }), at(3.5));
  assert.equal(state.mood, "hungry");
  assert.equal(state.hungryAt, "2026-10-20T09:00:00.000Z");
});

test("fridge: sleeps for a week, hungry after, starving after two", () => {
  const fridge = (days: number) => mood({ ...room(), fridgeSince: FED }, at(days * 24)).mood;
  assert.deepEqual([1, 6, 8, 15].map(fridge), ["sleeping", "sleeping", "hungry", "starving"]);
  // Hours on the counter before the fridge still count.
  const late = mood({ ...room(), fridgeSince: new Date(at(12)).toISOString() }, at(12 + 5 * 24));
  assert.equal(late.mood, "hungry");
});

test("calibration: median of observed / predicted, clamped", () => {
  const predicted = predictedPeakHours(feeding());
  const observed = (factor: number) => feeding({ peakAt: new Date(at(predicted * factor)).toISOString() });
  assert.equal(calibration([feeding()]), 1);
  assert.ok(Math.abs(calibration([observed(0.5), observed(0.6), observed(2)]) - 0.6) < 1e-6);
  assert.equal(calibration([observed(10)]), 3);
  // A slow starter peaks later than the rule of thumb says.
  const slow = mood({ ...room(), calibration: 2 }, at(predicted * 1.2));
  assert.equal(slow.mood, "rising");
});
