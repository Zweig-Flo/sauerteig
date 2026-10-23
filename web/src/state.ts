import { batchMood } from "../../shared/batch.ts";
import { rules } from "../../shared/kinds.ts";
import { mood } from "../../shared/mood.ts";
import type { Ferment } from "./api.ts";
import { when, whenDay } from "./format.ts";
import { useNow, type AnyMood } from "./pet.tsx";

export interface LiveState {
  mood: AnyMood;
  says: string;
  /** Hunger for what gets fed, progress to ready for a batch; null = nothing to show yet. */
  meter: { value: number; label: string; warn: boolean } | null;
  /** What comes next, e.g. "Höhepunkt etwa heute 21:30". */
  next: string | null;
}

/** The mood right now, recomputed every minute from the ferment's fields, the same way the server does. */
export function useLiveState(ferment: Ferment): LiveState {
  const now = useNow();
  if (ferment.family === "keep") {
    const state = mood(ferment, now);
    const last = ferment.lastFeeding;
    const next =
      state.mood === "sleeping"
        ? state.hungryAt && `Hunger ab ${when(state.hungryAt, now)}`
        : state.peakAt && state.mood !== "peak" && !last?.peakAt
          ? `Höhepunkt etwa ${when(state.peakAt, now)}`
          : (state.mood === "full" || state.mood === "rising" || state.mood === "peak") && state.hungryAt
            ? `Hunger ab ${when(state.hungryAt, now)}`
            : null;
    return {
      mood: state.mood,
      says: state.says,
      meter: last ? { value: state.hunger, label: "Hunger", warn: state.hunger >= 0.5 } : null,
      next,
    };
  }
  const state = batchMood(ferment, now);
  const kindRules = rules(ferment.kind);
  const stages = kindRules.family === "batch" && kindRules.stages.length > 1 ? `${state.stage.label}, ` : "";
  const next =
    state.mood === "done"
      ? null
      : state.mood === "burp"
        ? `${stages}Tag ${state.day}`
        : state.mood === "ready"
          ? `${stages}am besten bis ${whenDay(state.bestUntil, now)}`
          : state.mood === "overripe"
            ? `${stages}Tag ${state.day}`
            : `${stages}Tag ${state.day}, bereit ab ${whenDay(state.readyAt, now)}`;
  return {
    mood: state.mood,
    says: state.says,
    meter:
      state.mood === "done"
        ? null
        : { value: state.progress, label: "Reife", warn: state.mood === "overripe" || state.mood === "burp" },
    next,
  };
}
