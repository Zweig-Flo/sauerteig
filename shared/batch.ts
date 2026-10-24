// A batch (kimchi, sauerkraut, kombucha, …) as a Tamagotchi: its mood follows from the time in its stage, the room
// temperature and what was done to it. Pure, like shared/mood.ts.

import { slowdown, stagesOf, temperatureOf, type Kind, type Stage } from "./kinds.ts";

export type BatchMood = "fresh" | "bubbling" | "burp" | "ready" | "overripe" | "done";

/**
 * What can happen to a ferment besides a feeding. `burp` is a stage's recurring touch (burping, stirring, turning; see
 * `Stage.tend`), `feed` tends a culture.
 */
export const EVENT_KINDS = ["burp", "taste", "stage", "done", "feed"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export interface BatchInput {
  kind: Kind;
  variant?: string | null;
  startedAt: string;
  /** Room temperature in °C; null = the kind's default. */
  temperature: number | null;
  events: readonly { kind: EventKind; at: string }[];
}

export interface BatchState {
  mood: BatchMood;
  says: string;
  stage: Stage;
  /** 0-based, into the kind's stages. */
  stageIndex: number;
  /** Whole days in this stage, counted from 1. */
  day: number;
  /** Whole hours in this stage, for the short ones. */
  hours: number;
  /** 0 = just set up, 1 = ready. */
  progress: number;
  readyAt: string;
  bestUntil: string;
  overripeAt: string;
  /** When the stage wants its next touch; null when it needs none. */
  burpAt: string | null;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();

export function batchMood({ kind, variant, startedAt, temperature, events }: BatchInput, now = Date.now()): BatchState {
  const stages = stagesOf(kind, variant);
  const reference = temperatureOf(kind, variant) ?? 20;
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  const stageEvents = sorted.filter((e) => e.kind === "stage");
  const stageIndex = Math.min(stageEvents.length, stages.length - 1);
  const stage = stages[stageIndex];
  const stageStart = Date.parse(stageIndex > 0 ? stageEvents[stageIndex - 1].at : startedAt);
  const lastBurp = Math.max(
    stageStart,
    ...sorted.filter((e) => e.kind === "burp").map((e) => Date.parse(e.at)),
  );

  // Days are given at the kind's default temperature; 10 °C cooler doubles them. Fridge, cellar and sun don't count.
  const scale = (stage.fixed ? 1 : slowdown(temperature ?? reference, reference)) * DAY;
  const elapsed = Math.max(0, now - stageStart);
  const days = elapsed / scale;
  const readyAt = stageStart + stage.readyDays.from * scale;
  const overripeAt = stageStart + stage.overripeDays * scale;
  const burpAt = stage.tend ? lastBurp + stage.tend.everyHours * HOUR : null;
  const base = {
    stage,
    stageIndex,
    day: Math.floor(elapsed / DAY) + 1,
    hours: Math.floor(elapsed / HOUR),
    progress: stage.readyDays.from > 0 ? Math.min(1, days / stage.readyDays.from) : 1,
    readyAt: iso(readyAt),
    bestUntil: iso(stageStart + stage.readyDays.to * scale),
    overripeAt: iso(overripeAt),
    burpAt: burpAt === null ? null : iso(burpAt),
  };

  if (sorted.some((e) => e.kind === "done")) return { ...base, burpAt: null, mood: "done", says: "Fertig! Guten Appetit." };
  if (now >= overripeAt) return { ...base, mood: "overripe", says: "Ich bin drüber. Probier vorsichtig." };
  if (burpAt !== null && now >= burpAt) return { ...base, mood: "burp", says: stage.tend!.says };
  if (now >= readyAt) {
    const says = stage.next
      ? "Ich bin so weit für den nächsten Schritt."
      : stage.readyDays.from === 0
        ? "Ich bin fertig und ruhe kühl. Bedien dich!"
        : "Ich bin bereit! Probier mal.";
    return { ...base, mood: "ready", says };
  }
  // A long ferment is fresh for its first day, a short one for its first quarter.
  if (days < Math.min(1, stage.readyDays.from / 4)) return { ...base, mood: "fresh", says: "Frisch angesetzt, ich komme langsam in Gang." };
  return { ...base, mood: "bubbling", says: "Ich blubbere vor mich hin." };
}
