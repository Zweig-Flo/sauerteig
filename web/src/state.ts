import { batchMood } from "../../shared/batch.ts";
import { cultureMood } from "../../shared/culture.ts";
import { stagesOf } from "../../shared/kinds.ts";
import { mood } from "../../shared/mood.ts";
import type { Ferment } from "./api.ts";
import { when, whenDay } from "./format.ts";
import { MOOD_LABEL, useNow, type AnyMood } from "./pet.tsx";

/** How a mood is coloured: needs you, ready to use, working, or resting. */
export type Tone = "attention" | "ready" | "active" | "rest";

const TONE: Record<AnyMood, Tone> = {
  egg: "rest",
  full: "active",
  rising: "active",
  peak: "ready",
  hungry: "attention",
  starving: "attention",
  sleeping: "rest",
  fresh: "active",
  bubbling: "active",
  burp: "attention",
  ready: "ready",
  overripe: "attention",
  done: "rest",
};

/** What a starter or batch wants now, for the list of things due; null when nothing is due. */
const TODO: Partial<Record<AnyMood, string>> = {
  egg: "Zum ersten Mal füttern",
  peak: "Jetzt backen oder füttern",
  hungry: "Füttern",
  starving: "Dringend füttern",
  ready: "Probieren",
  overripe: "Abfüllen oder probieren",
};

export interface LiveState {
  tone: Tone;
  todo: string | null;
  mood: AnyMood;
  says: string;
  /** The tag next to the name. */
  label: string;
  /** A batch's stage, so the pet moves into the right vessel. */
  stage: number;
  /** Hunger for what gets fed or tended, progress to ready for a batch; null = nothing to show yet. */
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
      tone: TONE[state.mood],
      todo: TODO[state.mood] ?? null,
      mood: state.mood,
      says: state.says,
      label: MOOD_LABEL[state.mood],
      stage: 0,
      meter: last ? { value: state.hunger, label: "Hunger", warn: state.hunger >= 0.5 } : null,
      next,
    };
  }

  if (ferment.family === "culture") {
    const state = cultureMood(ferment, now);
    const next = state.readyAt
      ? `Bereit etwa ${when(state.readyAt, now)}`
      : state.mood === "hungry" || state.mood === "starving"
        ? null
        : `Hunger ab ${when(state.hungryAt, now)}`;
    return {
      tone: TONE[state.mood],
      todo: state.todo,
      mood: state.mood,
      says: state.says,
      label: MOOD_LABEL[state.mood],
      stage: 0,
      meter: { value: state.hunger, label: "Hunger", warn: state.hunger >= 0.5 },
      next,
    };
  }

  const state = batchMood(ferment, now);
  const { stage } = state;
  const stages = stagesOf(ferment.kind, ferment.variant).length > 1 ? `${stage.label}, ` : "";
  // Short stages count hours, the rest days.
  const age = stage.readyDays.to <= 2 && !stage.fixed ? `${state.hours} Std.` : `Tag ${state.day}`;
  // Done fermenting and kept cold: nothing to do but eat it up.
  const resting = state.mood === "ready" && stage.readyDays.from === 0;
  const next =
    state.mood === "done"
      ? null
      : resting
        ? `${stage.label}, am besten bis ${whenDay(state.bestUntil, now)}`
        : state.mood === "ready"
          ? `${stages}am besten bis ${whenDay(state.bestUntil, now)}`
          : state.mood === "burp" || state.mood === "overripe"
            ? `${stages}${age}`
            : `${stages}${age}, bereit ab ${whenDay(state.readyAt, now)}`;
  return {
    tone: resting ? "rest" : TONE[state.mood],
    todo:
      state.mood === "burp"
        ? stage.tend!.todo
        : resting
          ? null
          : state.mood === "ready" && stage.next
            ? stage.next
            : (TODO[state.mood] ?? null),
    mood: state.mood,
    says: state.says,
    label: state.mood === "burp" ? `${stage.tend!.todo}!` : resting ? stage.label : MOOD_LABEL[state.mood],
    stage: state.stageIndex,
    meter:
      state.mood === "done" || resting
        ? null
        : { value: state.progress, label: "Reife", warn: state.mood === "overripe" || state.mood === "burp" },
    next,
  };
}
